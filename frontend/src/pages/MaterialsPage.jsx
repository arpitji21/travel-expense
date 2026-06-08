import { useEffect, useState } from 'react';
import { PageLoading } from '../components/Loader';
import MaterialCard from '../components/MaterialCard';
import { fetchMaterials } from '../lib/salesApi';

function MaterialsPage() {
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMaterials()
      .then(setMaterials)
      .catch(() => setMaterials([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-semibold uppercase tracking-wide text-brand-400">Materials</p>
        <h2 className="text-3xl font-extrabold tracking-tight">Marketing &amp; sales materials</h2>
        <p className="mt-1 text-sm text-zinc-400">
          Brochures, decks, videos and more, shared by the management team. Open or download what you
          need for the field.
        </p>
      </div>

      {loading ? (
        <PageLoading label="Loading materials..." />
      ) : materials.length ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {materials.map((material) => (
            <MaterialCard key={material.id} material={material} />
          ))}
        </div>
      ) : (
        <section className="glass-card">
          <p className="px-5 py-10 text-center text-sm text-zinc-400">
            No materials shared yet. Check back soon.
          </p>
        </section>
      )}
    </div>
  );
}

export default MaterialsPage;
