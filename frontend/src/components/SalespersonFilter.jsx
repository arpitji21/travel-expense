function SalespersonFilter({ salespeople, value, onChange }) {
  return (
    <label className="flex items-center gap-2 text-sm font-medium text-zinc-700">
      Salesperson
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="rounded-xl border border-zinc-200 bg-white/80 px-3 py-2 text-sm shadow-sm outline-none transition focus:border-brand-400 focus:ring-4 focus:ring-brand-100"
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
