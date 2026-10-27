import { AIStatus, InvestigationDetail, InvestigationSummary, FullReport } from '../types';

const BASE_URL = '/api';

export async function fetchAIStatus(): Promise<AIStatus> {
  const res = await fetch(`${BASE_URL}/ai/status`);
  if (!res.ok) {
    throw new Error(`Failed to fetch AI status: ${res.statusText}`);
  }
  return res.json();
}

export async function scanText(text: string): Promise<InvestigationDetail> {
  const res = await fetch(`${BASE_URL}/investigations/scan`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text }),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    const message = errorData.detail?.message || errorData.detail || 'Scan failed';
    throw new Error(typeof message === 'string' ? message : JSON.stringify(message));
  }
  return res.json();
}

export async function addEvidence(
  invId: string,
  evidence: { title: string; source_url?: string; text: string; notes?: string }
): Promise<InvestigationDetail> {
  const res = await fetch(`${BASE_URL}/investigations/${invId}/evidence`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(evidence),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || 'Failed to add evidence');
  }
  return res.json();
}

export async function analyzeInvestigation(
  invId: string,
  claimId: string
): Promise<InvestigationDetail> {
  const res = await fetch(`${BASE_URL}/investigations/${invId}/analyze`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ claim_id: claimId }),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    const message = errorData.detail?.message || errorData.detail || 'Analysis failed';
    throw new Error(typeof message === 'string' ? message : JSON.stringify(message));
  }
  return res.json();
}

export async function listInvestigations(search?: string): Promise<InvestigationSummary[]> {
  const url = search
    ? `${BASE_URL}/investigations?search=${encodeURIComponent(search)}`
    : `${BASE_URL}/investigations`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error('Failed to load investigation history');
  }
  return res.json();
}

export async function getInvestigation(invId: string): Promise<InvestigationDetail> {
  const res = await fetch(`${BASE_URL}/investigations/${invId}`);
  if (!res.ok) {
    throw new Error('Investigation not found');
  }
  return res.json();
}

export async function deleteInvestigation(invId: string): Promise<void> {
  const res = await fetch(`${BASE_URL}/investigations/${invId}`, {
    method: 'DELETE',
  });
  if (!res.ok) {
    throw new Error('Failed to delete investigation');
  }
}

export async function getReport(invId: string): Promise<FullReport> {
  const res = await fetch(`${BASE_URL}/investigations/${invId}/report`);
  if (!res.ok) {
    throw new Error('Failed to load report');
  }
  return res.json();
}
