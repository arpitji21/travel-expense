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

// Daily schedule / assigned visits
export async function fetchSchedule(params = {}) {
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

// Notifications (in-app bell)
export async function fetchNotifications() {
  const response = await apiClient.get('/notifications');
  return response.data; // { notifications, unread }
}

export async function markNotificationsRead() {
  const response = await apiClient.post('/notifications/read');
  return response.data;
}

// Targets & performance
export async function fetchTargets(params = {}) {
  const response = await apiClient.get('/targets', { params });
  return response.data.targets;
}

export async function upsertTarget(payload) {
  const response = await apiClient.post('/targets', payload);
  return response.data.target;
}

export async function deleteTarget(targetId) {
  const response = await apiClient.delete(`/targets/${targetId}`);
  return response.data;
}

// Marketing & sales materials (finance uploads; everyone views)
export async function fetchMaterials() {
  const response = await apiClient.get('/materials');
  return response.data.materials;
}

export async function createMaterial({ title, description, category, linkUrl, file }) {
  const body = new FormData();
  body.append('title', title);
  if (description) body.append('description', description);
  if (category) body.append('category', category);
  if (linkUrl) body.append('linkUrl', linkUrl);
  if (file) body.append('file', file);

  const response = await apiClient.post('/materials', body, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return response.data.material;
}

export async function deleteMaterial(materialId) {
  const response = await apiClient.delete(`/materials/${materialId}`);
  return response.data;
}

// Stock (company-wide; finance manages, everyone views)
export async function fetchStock(params = {}) {
  const response = await apiClient.get('/stock', { params });
  return response.data.stock;
}

export async function createStock(payload) {
  const response = await apiClient.post('/stock', payload);
  return response.data.stock;
}

export async function updateStock(stockId, payload) {
  const response = await apiClient.put(`/stock/${stockId}`, payload);
  return response.data.stock;
}

export async function deleteStock(stockId) {
  const response = await apiClient.delete(`/stock/${stockId}`);
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

// --- Distributor Stock ---

export async function fetchDistributorStock(params = {}) {
  const response = await apiClient.get('/distributor-stock', { params });
  return response.data.stocks;
}

export async function createDistributorStock(payload) {
  const response = await apiClient.post('/distributor-stock', payload);
  return response.data.stock;
}

export async function updateDistributorStock(stockId, payload) {
  const response = await apiClient.put(`/distributor-stock/${stockId}`, payload);
  return response.data.stock;
}

export async function deleteDistributorStock(stockId) {
  const response = await apiClient.delete(`/distributor-stock/${stockId}`);
  return response.data;
}

// --- Stock Allocations ---

export async function fetchStockAllocations() {
  const response = await apiClient.get('/distributor-stock/allocations');
  return response.data.allocations;
}

export async function allocateStock(payload) {
  const response = await apiClient.post('/distributor-stock/allocate', payload);
  return response.data.allocation;
}

export async function fetchMyAssignedStock() {
  const response = await apiClient.get('/distributor-stock/my-assigned');
  return response.data.allocations;
}
