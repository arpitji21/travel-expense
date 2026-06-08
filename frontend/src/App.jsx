import { Navigate, Route, Routes } from 'react-router-dom';
import FinanceLayout from './components/FinanceLayout.jsx';
import LoginGate from './components/LoginGate.jsx';
import SalespersonLayout from './components/SalespersonLayout.jsx';
import CreateDemandPage from './pages/CreateDemandPage.jsx';
import CreateExpensePage from './pages/CreateExpensePage.jsx';
import DashboardPage from './pages/DashboardPage.jsx';
import DemandsPage from './pages/DemandsPage.jsx';
import ExpensesPage from './pages/ExpensesPage.jsx';
import SchedulePage from './pages/SchedulePage.jsx';
import StockPage from './pages/StockPage.jsx';
import MaterialsPage from './pages/MaterialsPage.jsx';
import FinanceDemandsPage from './pages/FinanceDemandsPage.jsx';
import FinanceExpensesPage from './pages/FinanceExpensesPage.jsx';
import FinanceStockPage from './pages/FinanceStockPage.jsx';
import FinanceMaterialsPage from './pages/FinanceMaterialsPage.jsx';
import FinanceSchedulePage from './pages/FinanceSchedulePage.jsx';
import FinanceTargetsPage from './pages/FinanceTargetsPage.jsx';
import FinanceSalespeoplePage from './pages/FinanceSalespeoplePage.jsx';
import FinanceSalespersonProfilePage from './pages/FinanceSalespersonProfilePage.jsx';

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
              <Route path="/materials" element={<FinanceMaterialsPage />} />
              <Route path="/targets" element={<FinanceTargetsPage />} />
              <Route path="/expenses" element={<FinanceExpensesPage />} />
              <Route path="/salespeople" element={<FinanceSalespeoplePage />} />
              <Route path="/salespeople/:userId" element={<FinanceSalespersonProfilePage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </FinanceLayout>
        ) : (
          <SalespersonLayout user={user}>
            <Routes>
              <Route path="/" element={<DashboardPage />} />
              <Route path="/schedule" element={<SchedulePage />} />
              <Route path="/demands" element={<DemandsPage />} />
              <Route path="/demands/new" element={<CreateDemandPage />} />
              <Route path="/stock" element={<StockPage />} />
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
