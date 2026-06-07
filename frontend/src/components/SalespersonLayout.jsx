import AppShell from './AppShell';

const navItems = [
  { to: '/', label: 'Dashboard' },
  { to: '/schedule', label: 'Schedule' },
  { to: '/demands', label: 'Demands' },
  { to: '/expenses', label: 'Expenses' }
];

function SalespersonLayout({ user, children }) {
  return (
    <AppShell roleLabel="Salesperson workspace" navItems={navItems} user={user}>
      {children}
    </AppShell>
  );
}

export default SalespersonLayout;
