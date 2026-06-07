import { Navigate, Route, Routes } from 'react-router-dom';
import FinanceLayout from './components/FinanceLayout.jsx';
import LoginGate from './components/LoginGate.jsx';
import SalespersonLayout from './components/SalespersonLayout.jsx';
import ClaimDetailsPage from './pages/ClaimDetailsPage.jsx';
import CreateClaimPage from './pages/CreateClaimPage.jsx';
import DashboardPage from './pages/DashboardPage.jsx';
import FinanceClaimDetailsPage from './pages/FinanceClaimDetailsPage.jsx';
import FinanceDashboardPage from './pages/FinanceDashboardPage.jsx';
import MyClaimsPage from './pages/MyClaimsPage.jsx';

function App() {
  return (
    <LoginGate>
      {(user) =>
        user.role === 'finance' ? (
          <FinanceLayout>
            <Routes>
              <Route path="/" element={<FinanceDashboardPage />} />
              <Route path="/claims/:claimId" element={<FinanceClaimDetailsPage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </FinanceLayout>
        ) : (
          <SalespersonLayout>
            <Routes>
              <Route path="/" element={<DashboardPage />} />
              <Route path="/claims/new" element={<CreateClaimPage />} />
              <Route path="/claims" element={<MyClaimsPage />} />
              <Route path="/claims/:claimId" element={<ClaimDetailsPage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </SalespersonLayout>
        )
      }
    </LoginGate>
  );
}

export default App;
