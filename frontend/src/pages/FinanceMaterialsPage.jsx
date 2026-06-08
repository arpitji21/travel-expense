import { useEffect, useState } from 'react';
import { PageLoading } from '../components/Loader';
import MaterialCard from '../components/MaterialCard';
import { createMaterial, deleteMaterial, fetchMaterials } from '../lib/salesApi';

function FinanceMaterialsPage() {
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [linkUrl, setLinkUrl] = useState('');

  async function loadMaterials() {
    setLoading(true);
    const data = await fetchMaterials();
    setMaterials(data);
    setLoading(false);
  }

  useEffect(() => {
    loadMaterials();
  }, []);

  function resetForm() {
    setTitle('');
    setCategory('');
    setDescription('');
    setLinkUrl('');
    setShowForm(false);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setMessage('');

    if (!linkUrl.trim()) {
      setMessage('Please paste a link (e.g. a Google Drive or YouTube URL).');
      return;
    }

    setSaving(true);
    try {
      await createMaterial({
        title,
        description,
        category,
        linkUrl: linkUrl.trim()
      });
      await loadMaterials();
      resetForm();
      setMessage('Material added.');
    } catch (err) {
      setMessage(err.response?.data?.message || 'Unable to add material.');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(materialId) {
    setMessage('');
    try {
      await deleteMaterial(materialId);
      await loadMaterials();
      setMessage('Material deleted.');
    } catch (err) {
      setMessage(err.response?.data?.message || 'Unable to delete material.');
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-brand-400">Materials</p>
          <h2 className="text-3xl font-extrabold tracking-tight">Marketing &amp; sales materials</h2>
          <p className="mt-1 text-sm text-zinc-400">
            Share a link (Google Drive / YouTube) to videos &amp; documents. Stored permanently; everyone can view them.
          </p>
        </div>
        <button type="button" onClick={() => setShowForm((value) => !value)} className="btn-primary">
          {showForm ? 'Close' : 'Add material'}
        </button>
      </div>

      {message ? (
        <p className="rounded-xl border border-white/10 bg-white/[0.05] px-3 py-2 text-sm text-zinc-200">{message}</p>
      ) : null}

      {showForm ? (
        <form onSubmit={handleSubmit} className="glass-card space-y-4 p-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="field-label">Title</span>
              <input
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                required
                className="input"
                placeholder="e.g. Q3 Product Brochure"
              />
            </label>
            <label className="block">
              <span className="field-label">Category (optional)</span>
              <input
                value={category}
                onChange={(event) => setCategory(event.target.value)}
                className="input"
                placeholder="e.g. Brochure, Video, Pricing"
              />
            </label>
          </div>

          <label className="block">
            <span className="field-label">Description (optional)</span>
            <input
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              className="input"
              placeholder="Short summary for the team"
            />
          </label>

          <label className="block">
            <span className="field-label">Link (Google Drive, YouTube, etc.)</span>
            <input
              value={linkUrl}
              onChange={(event) => setLinkUrl(event.target.value)}
              required
              className="input"
              placeholder="https://drive.google.com/..."
            />
            <span className="mt-1.5 block text-xs text-zinc-400">
              Share the file/folder as “Anyone with the link → Viewer”. Put videos &amp; documents in a
              Drive folder and paste the folder link to share many at once.
            </span>
          </label>

          <div className="flex gap-2">
            <button type="submit" disabled={saving} className="btn-primary">
              {saving ? 'Saving...' : 'Add material'}
            </button>
            <button type="button" onClick={resetForm} className="btn-ghost">
              Cancel
            </button>
          </div>
        </form>
      ) : null}

      {loading ? (
        <PageLoading label="Loading materials..." />
      ) : materials.length ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {materials.map((material) => (
            <MaterialCard key={material.id} material={material} onDelete={handleDelete} />
          ))}
        </div>
      ) : (
        <section className="glass-card">
          <p className="px-5 py-10 text-center text-sm text-zinc-400">
            No materials yet. Use “Add material” to share a Google Drive / YouTube link.
          </p>
        </section>
      )}
    </div>
  );
}

export default FinanceMaterialsPage;
