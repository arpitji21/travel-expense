import AppShell from './AppShell';

const navItems = [
  { to: '/', label: 'Demands' },
  { to: '/schedule', label: 'Visits' },
  { to: '/stock', label: 'Stock' },
  { to: '/distributor-stocks', label: 'Distributor Stocks' },
  { to: '/stock-allocations', label: 'Allocations' },
  { to: '/materials', label: 'Materials' },
  { to: '/expenses', label: 'Expenses' },
  { to: '/targets', label: 'Targets' },
  { to: '/salespeople', label: 'Salespeople' }
];

function FinanceLayout({ user, children }) {
  return (
    <AppShell roleLabel="Finance workspace" navItems={navItems} user={user}>
      {children}
    </AppShell>
  );
}

export default FinanceLayout;
