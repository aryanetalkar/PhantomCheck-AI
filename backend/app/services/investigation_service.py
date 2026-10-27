import uuid
import datetime
from typing import List, Dict, Any
from app.services.ollama_service import ollama_service
from app.prompts import (
    SYSTEM_BASE_INSTRUCTION,
    SCAN_PROMPT_TEMPLATE,
    EVALUATE_EVIDENCE_PROMPT_TEMPLATE,
    VERDICT_AND_REPORT_PROMPT_TEMPLATE,
)
from app.schemas.investigation import (
    Claim,
    ScanExtractionResult,
    EvidenceItem,
    EvidenceEvaluation,
    VerdictResponse,
    FullReport,
)

class InvestigationService:
    @staticmethod
    async def scan_text(raw_text: str) -> ScanExtractionResult:
        prompt = SCAN_PROMPT_TEMPLATE.format(
            system_base=SYSTEM_BASE_INSTRUCTION,
            raw_text=raw_text.strip()
        )
        data = await ollama_service.chat_json(prompt, retry_on_invalid=True)
        
        # Validate structure and ensure IDs exist
        main_c = data.get("main_claim") or {}
        if not main_c.get("id"):
            main_c["id"] = f"claim-{uuid.uuid4().hex[:6]}"
        main_c["is_main"] = True
        main_claim_obj = Claim(**main_c)

        other_claims_objs: List[Claim] = []
        for idx, oc in enumerate(data.get("other_claims", [])):
            if not oc.get("id"):
                oc["id"] = f"claim-{uuid.uuid4().hex[:6]}"
            oc["is_main"] = False
            other_claims_objs.append(Claim(**oc))

        sensational = data.get("sensational_wording", [])
        if not isinstance(sensational, list):
            sensational = []

        return ScanExtractionResult(
            main_claim=main_claim_obj,
            other_claims=other_claims_objs,
            sensational_wording=[str(s) for s in sensational],
        )

    @staticmethod
    async def evaluate_evidence(
        claim_text: str, evidence_list: List[Dict[str, Any]]
    ) -> List[EvidenceEvaluation]:
        if not evidence_list:
            return []

        evidence_blocks = []
        for e in evidence_list:
            source_note = f"Source URL: {e.get('source_url')}" if e.get('source_url') else "No URL provided"
            notes_str = f"User Notes: {e.get('notes')}" if e.get('notes') else ""
            block = (
                f"[ID: {e['id']}] Title: {e['title']}\n"
                f"{source_note}\n"
                f"{notes_str}\n"
                f"Text content:\n{e['text']}\n"
            )
            evidence_blocks.append(block)

        full_evidence_block = "\n---\n".join(evidence_blocks)
        prompt = EVALUATE_EVIDENCE_PROMPT_TEMPLATE.format(
            system_base=SYSTEM_BASE_INSTRUCTION,
            claim_text=claim_text,
            evidence_block=full_evidence_block,
        )

        data = await ollama_service.chat_json(prompt, retry_on_invalid=True)
        evaluations_raw = data.get("evaluations", [])
        results: List[EvidenceEvaluation] = []
        
        for item in evaluations_raw:
            stance = item.get("stance", "insufficient").lower()
            if stance not in ["supports", "contradicts", "insufficient"]:
                stance = "insufficient"
            results.append(
                EvidenceEvaluation(
                    evidence_id=str(item.get("evidence_id", "")),
                    title=str(item.get("title", "Evidence Item")),
                    what_it_says=str(item.get("what_it_says", "")),
                    stance=stance,
                    short_excerpt=str(item.get("short_excerpt", "")),
                    limitations=str(item.get("limitations", "None noted")),
                )
            )
        return results

    @staticmethod
    async def generate_verdict_and_report(
        investigation_id: str,
        original_message: str,
        claim: Claim,
        evidence_evaluations: List[EvidenceEvaluation],
    ) -> tuple[VerdictResponse, FullReport]:
        # If no evidence was provided, establish the preliminary UNVERIFIED baseline
        if not evidence_evaluations:
            verdict = VerdictResponse(
                claim_id=claim.id,
                claim_text=claim.text,
                verdict="UNVERIFIED",
                plain_explanation="No user-provided evidence was submitted to corroborate or refute this claim. Under media-literacy standards, unverified assertions or supernatural rumors cannot be validated without empirical documentation or official corroboration.",
                supporting_evidence=[],
                contradicting_evidence=[],
                inconclusive_evidence=[],
                limitations=[
                    "No evidence submitted for evaluation.",
                    "Local offline analysis without autonomous web retrieval.",
                    "Sensational phrasing or bizarre nature does not constitute disproof."
                ],
                confidence="Low",
                what_would_change_conclusion="Official statements from institutional authorities, timestamped security recordings, or verified independent corroboration.",
            )

            report = FullReport(
                investigation_id=investigation_id,
                original_message=original_message,
                claim_investigated=claim,
                evidence_reviewed=[],
                verdict=verdict,
                reasoning="The input text presents a claim without accompanying empirical evidence. In media literacy and forensic claim verification, absence of evidence results in a preliminary UNVERIFIED status rather than an assumption of truth or falsehood.",
                suggested_verification_steps=claim.ways_to_verify or [
                    "Check official university/department notice boards.",
                    "Inquire directly with administration or facility managers.",
                    "Perform reverse search for recycled viral rumors."
                ],
                limitations=[
                    "Relying solely on user-supplied material; no autonomous web searching.",
                    "Supernatural claims cannot be confirmed without rigorous scientific methodology."
                ],
                model_name=ollama_service.model,
                timestamp=datetime.datetime.utcnow().isoformat() + "Z",
            )
            return verdict, report

        # When evidence exists, run Gemma for the synthesis
        summary_lines = []
        for ev in evidence_evaluations:
            summary_lines.append(
                f"- [Evidence ID: {ev.evidence_id}] Title: '{ev.title}' | Stance: {ev.stance.upper()}\n"
                f"  Summary: {ev.what_it_says}\n"
                f"  Excerpt: \"{ev.short_excerpt}\"\n"
                f"  Limitations: {ev.limitations}"
            )
        evidence_summary_str = "\n".join(summary_lines)

        prompt = VERDICT_AND_REPORT_PROMPT_TEMPLATE.format(
            system_base=SYSTEM_BASE_INSTRUCTION,
            claim_text=claim.text,
            evidence_evaluations_summary=evidence_summary_str,
        )

        data = await ollama_service.chat_json(prompt, retry_on_invalid=True)
        raw_verdict = data.get("verdict", {})
        
        # Enforce exact allowed verdict values
        v_status = str(raw_verdict.get("verdict", "UNVERIFIED")).upper()
        if v_status not in ["SUPPORTED", "CONTRADICTED", "UNVERIFIED"]:
            v_status = "UNVERIFIED"

        conf = str(raw_verdict.get("confidence", "Low")).capitalize()
        if conf not in ["Low", "Moderate", "High"]:
            conf = "Low"

        verdict_obj = VerdictResponse(
            claim_id=claim.id,
            claim_text=claim.text,
            verdict=v_status,
            plain_explanation=str(raw_verdict.get("plain_explanation", "Analysis completed based on submitted evidence.")),
            supporting_evidence=raw_verdict.get("supporting_evidence") or [],
            contradicting_evidence=raw_verdict.get("contradicting_evidence") or [],
            inconclusive_evidence=raw_verdict.get("inconclusive_evidence") or [],
            limitations=raw_verdict.get("limitations") or ["Evaluation restricted to user-supplied text."],
            confidence=conf,
            what_would_change_conclusion=str(raw_verdict.get("what_would_change_conclusion", "Further verified independent documentation.")),
        )

        report_obj = FullReport(
            investigation_id=investigation_id,
            original_message=original_message,
            claim_investigated=claim,
            evidence_reviewed=evidence_evaluations,
            verdict=verdict_obj,
            reasoning=str(data.get("reasoning", "Evidence evaluated against claim criteria.")),
            suggested_verification_steps=data.get("suggested_verification_steps") or claim.ways_to_verify or [],
            limitations=data.get("report_limitations") or verdict_obj.limitations,
            model_name=ollama_service.model,
            timestamp=datetime.datetime.utcnow().isoformat() + "Z",
        )

        return verdict_obj, report_obj

investigation_service = InvestigationService()
