'use client';

interface EmptyStateProps {
  icon?:    React.ReactNode;
  title:    string;
  message?: string;
  cta?:     { label: string; href?: string; onClick?: () => void };
}

export function EmptyState({ icon, title, message, cta }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      {icon && <div className="mb-4 text-slate-500">{icon}</div>}
      <h3 className="text-lg font-semibold text-slate-200 mb-1">{title}</h3>
      {message && <p className="text-sm text-slate-500 max-w-md">{message}</p>}
      {cta && (
        <div className="mt-5">
          {cta.href ? (
            <a href={cta.href} className="inline-flex items-center px-4 py-2 rounded-lg bg-red-700 text-white text-sm font-medium hover:bg-red-800 transition-colors">
              {cta.label}
            </a>
          ) : (
            <button onClick={cta.onClick} className="inline-flex items-center px-4 py-2 rounded-lg bg-red-700 text-white text-sm font-medium hover:bg-red-800 transition-colors">
              {cta.label}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
