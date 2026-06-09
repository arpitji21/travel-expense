import AppShell from './AppShell';

const navItems = [
  { to: '/', label: 'Dashboard' },
  { to: '/schedule', label: 'Visits' },
  { to: '/demands', label: 'Demands' },
  { to: '/stock', label: 'Stock' },
  { to: '/assigned-stock', label: 'Assigned Stock' },
  { to: '/materials', label: 'Materials' },
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
