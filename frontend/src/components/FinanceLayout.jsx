import AppShell from './AppShell';

const navItems = [
  { to: '/', label: 'Demands' },
  { to: '/expenses', label: 'Expenses' },
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
