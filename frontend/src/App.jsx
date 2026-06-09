import { Navigate, Route, Routes } from 'react-router-dom';
import DistributorLayout from './components/DistributorLayout.jsx';
import FinanceLayout from './components/FinanceLayout.jsx';
import LoginGate from './components/LoginGate.jsx';
import SalespersonLayout from './components/SalespersonLayout.jsx';
import CreateDemandPage from './pages/CreateDemandPage.jsx';
import CreateExpensePage from './pages/CreateExpensePage.jsx';
import DashboardPage from './pages/DashboardPage.jsx';
import DemandsPage from './pages/DemandsPage.jsx';
import DistributorAllocationsPage from './pages/DistributorAllocationsPage.jsx';
import DistributorInventoryPage from './pages/DistributorInventoryPage.jsx';
import ExpensesPage from './pages/ExpensesPage.jsx';
import FinanceAllocationsPage from './pages/FinanceAllocationsPage.jsx';
import FinanceDemandsPage from './pages/FinanceDemandsPage.jsx';
import FinanceDistributorStockPage from './pages/FinanceDistributorStockPage.jsx';
import FinanceExpensesPage from './pages/FinanceExpensesPage.jsx';
import FinanceMaterialsPage from './pages/FinanceMaterialsPage.jsx';
import FinanceSalespeoplePage from './pages/FinanceSalespeoplePage.jsx';
import FinanceSalespersonProfilePage from './pages/FinanceSalespersonProfilePage.jsx';
import FinanceSchedulePage from './pages/FinanceSchedulePage.jsx';
import FinanceStockPage from './pages/FinanceStockPage.jsx';
import FinanceTargetsPage from './pages/FinanceTargetsPage.jsx';
import MaterialsPage from './pages/MaterialsPage.jsx';
import SalespersonAssignedStockPage from './pages/SalespersonAssignedStockPage.jsx';
import SchedulePage from './pages/SchedulePage.jsx';
import StockPage from './pages/StockPage.jsx';

function App() {
  return (
    <LoginGate>
      {(user) =>
        user.role === 'finance' ? (
          <FinanceLayout user={user}>
            <Routes>
              <Route path="/" element={<FinanceDemandsPage />} />
              <Route path="/schedule" element={<FinanceSchedulePage />} />
              <Route path="/stock" element={<FinanceStockPage />} />
              <Route path="/distributor-stocks" element={<FinanceDistributorStockPage />} />
              <Route path="/stock-allocations" element={<FinanceAllocationsPage />} />
              <Route path="/materials" element={<FinanceMaterialsPage />} />
              <Route path="/targets" element={<FinanceTargetsPage />} />
              <Route path="/expenses" element={<FinanceExpensesPage />} />
              <Route path="/salespeople" element={<FinanceSalespeoplePage />} />
              <Route path="/salespeople/:userId" element={<FinanceSalespersonProfilePage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </FinanceLayout>
        ) : user.role === 'distributor' ? (
          <DistributorLayout user={user}>
            <Routes>
              <Route path="/" element={<DistributorInventoryPage />} />
              <Route path="/allocations" element={<DistributorAllocationsPage />} />
              <Route path="/materials" element={<MaterialsPage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </DistributorLayout>
        ) : (
          <SalespersonLayout user={user}>
            <Routes>
              <Route path="/" element={<DashboardPage />} />
              <Route path="/schedule" element={<SchedulePage />} />
              <Route path="/demands" element={<DemandsPage />} />
              <Route path="/demands/new" element={<CreateDemandPage />} />
              <Route path="/stock" element={<StockPage />} />
              <Route path="/assigned-stock" element={<SalespersonAssignedStockPage />} />
              <Route path="/materials" element={<MaterialsPage />} />
              <Route path="/expenses" element={<ExpensesPage />} />
              <Route path="/expenses/new" element={<CreateExpensePage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </SalespersonLayout>
        )
      }
    </LoginGate>
  );
}

export default App;
