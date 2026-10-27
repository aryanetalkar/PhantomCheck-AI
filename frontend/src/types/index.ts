export interface AIStatus {
  status: 'ready' | 'model_missing' | 'unreachable';
  model: string;
  base_url: string;
  message: string;
  install_command?: string | null;
}

export interface Claim {
  id: string;
  text: string;
  category: string;
  entities_and_dates: string[];
  checkable: boolean;
  missing_info: string;
  ways_to_verify: string[];
  is_main: boolean;
}

export interface EvidenceItem {
  id: string;
  title: string;
  source_url?: string | null;
  text: string;
  notes?: string | null;
  created_at: string;
}

export interface EvidenceEvaluation {
  evidence_id: string;
  title: string;
  what_it_says: string;
  stance: 'supports' | 'contradicts' | 'insufficient';
  short_excerpt: string;
  limitations: string;
}

export type VerdictStatus = 'SUPPORTED' | 'CONTRADICTED' | 'UNVERIFIED';
export type ConfidenceLevel = 'Low' | 'Moderate' | 'High';

export interface VerdictResponse {
  claim_id: string;
  claim_text: string;
  verdict: VerdictStatus;
  plain_explanation: string;
  supporting_evidence: string[];
  contradicting_evidence: string[];
  inconclusive_evidence: string[];
  limitations: string[];
  confidence: ConfidenceLevel;
  what_would_change_conclusion: string;
}

export interface FullReport {
  investigation_id: string;
  original_message: string;
  claim_investigated: Claim;
  evidence_reviewed: EvidenceEvaluation[];
  verdict: VerdictResponse;
  reasoning: string;
  suggested_verification_steps: string[];
  limitations: string[];
  model_name: string;
  timestamp: string;
}

export interface InvestigationDetail {
  id: string;
  raw_input: string;
  selected_claim_id?: string | null;
  claims: Claim[];
  sensational_wording: string[];
  evidence: EvidenceItem[];
  evidence_evaluations: EvidenceEvaluation[];
  verdict?: VerdictResponse | null;
  report?: FullReport | null;
  model: string;
  created_at: string;
  updated_at: string;
}

export interface InvestigationSummary {
  id: string;
  raw_input_snippet: string;
  selected_claim_text?: string | null;
  verdict_status?: string | null;
  claims_count: number;
  evidence_count: number;
  model: string;
  created_at: string;
  updated_at: string;
}

export interface HalloweenSample {
  id: string;
  title: string;
  preview: string;
  fullText: string;
}
