function SalespersonFilter({ salespeople, value, onChange }) {
  return (
    <label className="flex items-center gap-2 text-sm font-medium text-zinc-200">
      Salesperson
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="rounded-xl border border-white/10 bg-white/[0.06] px-3 py-2 text-sm shadow-sm outline-none transition focus:border-brand-400 focus:ring-4 focus:ring-brand-500/25"
      >
        <option value="">All salespeople</option>
        {salespeople.map((person) => (
          <option key={person.id} value={person.id}>
            {person.email}
          </option>
        ))}
      </select>
    </label>
  );
}

export default SalespersonFilter;
