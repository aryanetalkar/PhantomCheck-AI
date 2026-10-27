import uuid
import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc

from app.database import get_db
from app.models.investigation import Investigation
from app.services.ollama_service import ollama_service
from app.services.investigation_service import investigation_service
from app.schemas.investigation import (
    AIStatusResponse,
    ScanRequest,
    EvidenceCreateRequest,
    EvidenceItem,
    EvidenceEvaluation,
    AnalyzeRequest,
    VerdictResponse,
    FullReport,
    InvestigationSummary,
    InvestigationDetail,
    Claim,
)

router = APIRouter()

@router.get("/ai/status", response_model=AIStatusResponse)
async def get_ai_status():
    status_info = await ollama_service.get_status()
    return status_info

@router.post("/investigations/scan", response_model=InvestigationDetail)
async def scan_investigation(payload: ScanRequest, db: AsyncSession = Depends(get_db)):
    # 1. Check AI readiness
    status_info = await ollama_service.get_status()
    if status_info["status"] != "ready":
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail={
                "message": status_info["message"],
                "status": status_info["status"],
                "install_command": status_info.get("install_command"),
            },
        )

    # 2. Extract claims via Gemma
    try:
        scan_res = await investigation_service.scan_text(payload.text)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"AI claim extraction failed: {str(e)}",
        )

    all_claims = [scan_res.main_claim.model_dump()] + [
        c.model_dump() for c in scan_res.other_claims
    ]

    new_id = str(uuid.uuid4())
    investigation = Investigation(
        id=new_id,
        raw_input=payload.text,
        selected_claim_id=scan_res.main_claim.id,
        claims=all_claims,
        sensational_wording=scan_res.sensational_wording,
        evidence=[],
        evidence_evaluations=[],
        verdict=None,
        report=None,
        model=ollama_service.model,
    )
    db.add(investigation)
    await db.commit()
    await db.refresh(investigation)

    return investigation_to_detail(investigation)

@router.post("/investigations/{inv_id}/evidence", response_model=InvestigationDetail)
async def add_evidence(
    inv_id: str, payload: EvidenceCreateRequest, db: AsyncSession = Depends(get_db)
):
    query = select(Investigation).where(Investigation.id == inv_id)
    res = await db.execute(query)
    inv = res.scalar_one_or_none()
    if not inv:
        raise HTTPException(status_code=404, detail="Investigation not found")

    new_item = EvidenceItem(
        id=f"evi-{uuid.uuid4().hex[:6]}",
        title=payload.title,
        source_url=payload.source_url,
        text=payload.text,
        notes=payload.notes,
        created_at=datetime.datetime.utcnow().isoformat() + "Z",
    )

    # Append to JSON list
    curr_evidence = list(inv.evidence or [])
    curr_evidence.append(new_item.model_dump())
    inv.evidence = curr_evidence
    # Reset previous verdict since evidence set changed
    inv.verdict = None
    inv.report = None
    inv.evidence_evaluations = []

    await db.commit()
    await db.refresh(inv)
    return investigation_to_detail(inv)

@router.post("/investigations/{inv_id}/analyze", response_model=InvestigationDetail)
async def analyze_investigation(
    inv_id: str, payload: AnalyzeRequest, db: AsyncSession = Depends(get_db)
):
    query = select(Investigation).where(Investigation.id == inv_id)
    res = await db.execute(query)
    inv = res.scalar_one_or_none()
    if not inv:
        raise HTTPException(status_code=404, detail="Investigation not found")

    # Find target claim
    claims_list = [Claim(**c) for c in (inv.claims or [])]
    target_claim = next((c for c in claims_list if c.id == payload.claim_id), None)
    if not target_claim:
        raise HTTPException(status_code=400, detail="Target claim not found in investigation")

    # Check AI readiness
    status_info = await ollama_service.get_status()
    if status_info["status"] != "ready":
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail={
                "message": status_info["message"],
                "status": status_info["status"],
                "install_command": status_info.get("install_command"),
            },
        )

    try:
        # 1. Evaluate user-provided evidence items
        evaluations = await investigation_service.evaluate_evidence(
            claim_text=target_claim.text,
            evidence_list=inv.evidence or [],
        )

        # 2. Generate verdict & media literacy report
        verdict, report = await investigation_service.generate_verdict_and_report(
            investigation_id=inv.id,
            original_message=inv.raw_input,
            claim=target_claim,
            evidence_evaluations=evaluations,
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"Analysis failed: {str(e)}",
        )

    inv.selected_claim_id = target_claim.id
    inv.evidence_evaluations = [ev.model_dump() for ev in evaluations]
    inv.verdict = verdict.model_dump()
    inv.report = report.model_dump()

    await db.commit()
    await db.refresh(inv)
    return investigation_to_detail(inv)

@router.get("/investigations", response_model=List[InvestigationSummary])
async def list_investigations(
    search: Optional[str] = None, db: AsyncSession = Depends(get_db)
):
    query = select(Investigation).order_by(desc(Investigation.created_at))
    res = await db.execute(query)
    items = res.scalars().all()

    summaries: List[InvestigationSummary] = []
    for inv in items:
        # Check text search filter if provided
        if search:
            s_lower = search.lower()
            text_match = s_lower in inv.raw_input.lower()
            claim_match = any(
                s_lower in str(c.get("text", "")).lower() for c in (inv.claims or [])
            )
            if not (text_match or claim_match):
                continue

        # Extract selected claim text if any
        selected_claim_text = None
        if inv.selected_claim_id and inv.claims:
            for c in inv.claims:
                if c.get("id") == inv.selected_claim_id:
                    selected_claim_text = c.get("text")
                    break
        elif inv.claims and len(inv.claims) > 0:
            selected_claim_text = inv.claims[0].get("text")

        verdict_status = inv.verdict.get("verdict") if inv.verdict else None

        snippet = (
            inv.raw_input[:120] + "..." if len(inv.raw_input) > 120 else inv.raw_input
        )

        summaries.append(
            InvestigationSummary(
                id=inv.id,
                raw_input_snippet=snippet,
                selected_claim_text=selected_claim_text,
                verdict_status=verdict_status,
                claims_count=len(inv.claims or []),
                evidence_count=len(inv.evidence or []),
                model=inv.model,
                created_at=inv.created_at,
                updated_at=inv.updated_at,
            )
        )
    return summaries

@router.get("/investigations/{inv_id}", response_model=InvestigationDetail)
async def get_investigation(inv_id: str, db: AsyncSession = Depends(get_db)):
    query = select(Investigation).where(Investigation.id == inv_id)
    res = await db.execute(query)
    inv = res.scalar_one_or_none()
    if not inv:
        raise HTTPException(status_code=404, detail="Investigation not found")
    return investigation_to_detail(inv)

@router.delete("/investigations/{inv_id}")
async def delete_investigation(inv_id: str, db: AsyncSession = Depends(get_db)):
    query = select(Investigation).where(Investigation.id == inv_id)
    res = await db.execute(query)
    inv = res.scalar_one_or_none()
    if not inv:
        raise HTTPException(status_code=404, detail="Investigation not found")
    await db.delete(inv)
    await db.commit()
    return {"message": "Investigation deleted successfully", "id": inv_id}

@router.get("/investigations/{inv_id}/report", response_model=FullReport)
async def get_investigation_report(inv_id: str, db: AsyncSession = Depends(get_db)):
    query = select(Investigation).where(Investigation.id == inv_id)
    res = await db.execute(query)
    inv = res.scalar_one_or_none()
    if not inv:
        raise HTTPException(status_code=404, detail="Investigation not found")
    if not inv.report:
        raise HTTPException(
            status_code=400,
            detail="Report has not been generated yet. Please run analyze first.",
        )
    return FullReport(**inv.report)

def investigation_to_detail(inv: Investigation) -> InvestigationDetail:
    return InvestigationDetail(
        id=inv.id,
        raw_input=inv.raw_input,
        selected_claim_id=inv.selected_claim_id,
        claims=[Claim(**c) for c in (inv.claims or [])],
        sensational_wording=inv.sensational_wording or [],
        evidence=[EvidenceItem(**e) for e in (inv.evidence or [])],
        evidence_evaluations=[
            EvidenceEvaluation(**ev) for ev in (inv.evidence_evaluations or [])
        ],
        verdict=VerdictResponse(**inv.verdict) if inv.verdict else None,
        report=FullReport(**inv.report) if inv.report else None,
        model=inv.model,
        created_at=inv.created_at,
        updated_at=inv.updated_at,
    )
