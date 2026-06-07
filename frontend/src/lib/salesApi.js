import { apiClient } from './apiClient';

export async function login(email, password) {
  const response = await apiClient.post('/auth/login', { email, password });
  return response.data;
}

export async function register(email, password, role) {
  const response = await apiClient.post('/auth/register', { email, password, role });
  return response.data;
}

export async function fetchMe() {
  const response = await apiClient.get('/auth/me');
  return response.data;
}

// Users (finance only) - used to filter demands/expenses by salesperson.
export async function fetchSalespeople() {
  const response = await apiClient.get('/users');
  return response.data.users.filter((user) => user.role === 'sales');
}

export async function fetchUser(userId) {
  const response = await apiClient.get(`/users/${userId}`);
  return response.data.user;
}

// Daily schedule
export async function fetchSchedule(userId) {
  const params = userId ? { userId } : {};
  const response = await apiClient.get('/schedule', { params });
  return response.data.entries;
}

export async function createScheduleEntry(payload) {
  const response = await apiClient.post('/schedule', payload);
  return response.data.entry;
}

export async function updateScheduleEntry(entryId, payload) {
  const response = await apiClient.put(`/schedule/${entryId}`, payload);
  return response.data.entry;
}

export async function deleteScheduleEntry(entryId) {
  const response = await apiClient.delete(`/schedule/${entryId}`);
  return response.data;
}

// Demands
export async function fetchDemands(userId) {
  const params = userId ? { userId } : {};
  const response = await apiClient.get('/demands', { params });
  return response.data.demands;
}

// Today's route: hospitals (grouped) that have open demands.
export async function fetchTodayRoute(userId) {
  const params = userId ? { userId } : {};
  const response = await apiClient.get('/demands/route', { params });
  return response.data.route;
}

export async function createDemand(payload) {
  const response = await apiClient.post('/demands', payload);
  return response.data.demand;
}

export async function updateDemand(demandId, payload) {
  const response = await apiClient.put(`/demands/${demandId}`, payload);
  return response.data.demand;
}

export async function deleteDemand(demandId) {
  const response = await apiClient.delete(`/demands/${demandId}`);
  return response.data;
}

// Expenses (metro bills)
export async function fetchExpenses(userId) {
  const params = userId ? { userId } : {};
  const response = await apiClient.get('/expenses', { params });
  return response.data.expenses;
}

export async function createExpense(payload) {
  const response = await apiClient.post('/expenses', payload);
  return response.data.expense;
}

export async function uploadReceipt(expenseId, file) {
  const body = new FormData();
  body.append('receipt', file);

  const response = await apiClient.post(`/expenses/${expenseId}/receipt`, body, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });

  return response.data.expense;
}

export async function deleteExpense(expenseId) {
  const response = await apiClient.delete(`/expenses/${expenseId}`);
  return response.data;
}

export async function approveExpense(expenseId) {
  const response = await apiClient.post(`/expenses/${expenseId}/approve`);
  return response.data.expense;
}

export async function rejectExpense(expenseId) {
  const response = await apiClient.post(`/expenses/${expenseId}/reject`);
  return response.data.expense;
}

export async function reimburseExpense(expenseId) {
  const response = await apiClient.post(`/expenses/${expenseId}/reimburse`);
  return response.data.expense;
}
