import { apiClient } from './apiClient';

export async function login(email, password) {
  const response = await apiClient.post('/auth/login', { email, password });
  return response.data;
}

export async function fetchMe() {
  const response = await apiClient.get('/auth/me');
  return response.data;
}

export async function fetchClaims() {
  const response = await apiClient.get('/claims');
  return response.data.claims;
}

export async function fetchClaim(claimId) {
  const response = await apiClient.get(`/claims/${claimId}`);
  return response.data.claim;
}

export async function createClaim(payload) {
  const response = await apiClient.post('/claims', payload);
  return response.data.claim;
}

export async function addTravelLeg(payload) {
  const response = await apiClient.post('/travel-legs', payload);
  return response.data.travelLeg;
}

export async function addExpense(payload) {
  const response = await apiClient.post('/expenses', payload);
  return response.data;
}

export async function uploadReceipt(expenseId, file) {
  const body = new FormData();
  body.append('receipt', file);

  const response = await apiClient.post(`/expenses/${expenseId}/receipt`, body, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });

  return response.data;
}

export async function submitClaim(claimId) {
  const response = await apiClient.post(`/claims/${claimId}/submit`);
  return response.data.claim;
}

export async function approveClaim(claimId) {
  const response = await apiClient.post(`/claims/${claimId}/approve`);
  return response.data.claim;
}

export async function rejectClaim(claimId) {
  const response = await apiClient.post(`/claims/${claimId}/reject`);
  return response.data.claim;
}

export async function reimburseClaim(claimId) {
  const response = await apiClient.post(`/claims/${claimId}/reimburse`);
  return response.data.claim;
}
