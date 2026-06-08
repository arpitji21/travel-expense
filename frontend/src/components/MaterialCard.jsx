import { buildAssetUrl } from '../lib/apiClient';
import { formatDate } from '../lib/formatters';

function MaterialCard({ material, onDelete }) {
  const isLink = material.kind === 'link';
  const href = isLink ? material.linkUrl : buildAssetUrl(material.fileUrl);

  return (
    <div className="glass-card flex flex-col p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="grid h-10 w-10 flex-none place-items-center rounded-xl border border-white/10 bg-white/[0.04] text-lg">
            {isLink ? '🔗' : '📄'}
          </span>
          <div>
            <p className="font-semibold leading-tight">{material.title}</p>
            {material.category ? (
              <span className="mt-1 inline-block rounded-full border border-brand-500/30 bg-brand-500/10 px-2 py-0.5 text-xs font-medium text-brand-300">
                {material.category}
              </span>
            ) : null}
          </div>
        </div>
        {onDelete ? (
          <button
            type="button"
            onClick={() => onDelete(material.id)}
            className="text-xs font-semibold text-rose-400 transition hover:text-rose-300"
          >
            Delete
          </button>
        ) : null}
      </div>

      {material.description ? (
        <p className="mt-3 text-sm text-zinc-400">{material.description}</p>
      ) : null}

      <div className="mt-4 flex items-center justify-between gap-3 border-t border-white/10 pt-3">
        <span className="truncate text-xs text-zinc-400">
          {material.uploadedByEmail || 'Management'} · {formatDate(material.createdAt)}
        </span>
        <a href={href} target="_blank" rel="noreferrer" className="btn-primary btn-sm flex-none">
          {isLink ? 'Open link' : 'Open / Download'}
        </a>
      </div>
    </div>
  );
}

export default MaterialCard;
