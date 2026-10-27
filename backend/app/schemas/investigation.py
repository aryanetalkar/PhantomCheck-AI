from typing import List, Optional, Literal
from pydantic import BaseModel, Field
import datetime

# --- AI Status ---
class AIStatusResponse(BaseModel):
    status: Literal["ready", "model_missing", "unreachable"]
    model: str
    base_url: str
    message: str
    install_command: Optional[str] = None

# --- Claim schemas ---
class Claim(BaseModel):
    id: str
    text: str
    category: str
    entities_and_dates: List[str] = Field(default_factory=list)
    checkable: bool
    missing_info: str
    ways_to_verify: List[str] = Field(default_factory=list)
    is_main: bool = False

class ScanExtractionResult(BaseModel):
    main_claim: Claim
    other_claims: List[Claim] = Field(default_factory=list)
    sensational_wording: List[str] = Field(default_factory=list)

class ScanRequest(BaseModel):
    text: str = Field(..., min_length=1, max_length=5000)

# --- Evidence schemas ---
class EvidenceItem(BaseModel):
    id: str
    title: str
    source_url: Optional[str] = None
    text: str
    notes: Optional[str] = None
    created_at: str

class EvidenceCreateRequest(BaseModel):
    title: str = Field(..., min_length=1, max_length=200)
    source_url: Optional[str] = Field(None, max_length=1000)
    text: str = Field(..., min_length=1, max_length=10000)
    notes: Optional[str] = Field(None, max_length=1000)

class EvidenceEvaluation(BaseModel):
    evidence_id: str
    title: str
    what_it_says: str
    stance: Literal["supports", "contradicts", "insufficient"]
    short_excerpt: str
    limitations: str

# --- Verdict schemas ---
VerdictStatus = Literal["SUPPORTED", "CONTRADICTED", "UNVERIFIED"]
ConfidenceLevel = Literal["Low", "Moderate", "High"]

class VerdictResponse(BaseModel):
    claim_id: str
    claim_text: str
    verdict: VerdictStatus
    plain_explanation: str
    supporting_evidence: List[str] = Field(default_factory=list)
    contradicting_evidence: List[str] = Field(default_factory=list)
    inconclusive_evidence: List[str] = Field(default_factory=list)
    limitations: List[str] = Field(default_factory=list)
    confidence: ConfidenceLevel
    what_would_change_conclusion: str

class AnalyzeRequest(BaseModel):
    claim_id: str

# --- Full Report schema ---
class FullReport(BaseModel):
    investigation_id: str
    original_message: str
    claim_investigated: Claim
    evidence_reviewed: List[EvidenceEvaluation] = Field(default_factory=list)
    verdict: VerdictResponse
    reasoning: str
    suggested_verification_steps: List[str] = Field(default_factory=list)
    limitations: List[str] = Field(default_factory=list)
    model_name: str
    timestamp: str

# --- Investigation summary & detail ---
class InvestigationSummary(BaseModel):
    id: str
    raw_input_snippet: str
    selected_claim_text: Optional[str] = None
    verdict_status: Optional[str] = None
    claims_count: int
    evidence_count: int
    model: str
    created_at: datetime.datetime
    updated_at: datetime.datetime

class InvestigationDetail(BaseModel):
    id: str
    raw_input: str
    selected_claim_id: Optional[str] = None
    claims: List[Claim] = Field(default_factory=list)
    sensational_wording: List[str] = Field(default_factory=list)
    evidence: List[EvidenceItem] = Field(default_factory=list)
    evidence_evaluations: List[EvidenceEvaluation] = Field(default_factory=list)
    verdict: Optional[VerdictResponse] = None
    report: Optional[FullReport] = None
    model: str
    created_at: datetime.datetime
    updated_at: datetime.datetime
