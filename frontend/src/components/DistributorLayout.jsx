import AppShell from './AppShell.jsx';

const NAV_ITEMS = [
  { to: '/', label: 'Inventory' },
  { to: '/allocations', label: 'Allocation History' },
  { to: '/materials', label: 'Materials' }
];

function DistributorLayout({ user, children }) {
  return (
    <AppShell roleLabel="Distributor Department" navItems={NAV_ITEMS} user={user}>
      {children}
    </AppShell>
  );
}

export default DistributorLayout;
