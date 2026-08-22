/**
 * Shared UI primitives for all admin pages.
 * Import from here instead of copy-pasting styles across pages.
 */

// ─── Formatters ───────────────────────────────────────────────────────────────

export const money = (n) =>
  typeof n === "number"
    ? n.toLocaleString("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 0, maximumFractionDigits: 0 })
    : "—";

export const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—";

// ─── Design tokens ────────────────────────────────────────────────────────────

export const btn = {
  primary:     "px-4 py-2 rounded-lg bg-[#0B1F2A] text-white text-sm font-medium hover:opacity-90 disabled:opacity-50 transition-opacity",
  secondary:   "px-4 py-2 rounded-lg border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-50",
  gold:        "px-4 py-2 rounded-lg bg-[#C9A24B] text-[#0B1F2A] text-sm font-medium hover:opacity-90 disabled:opacity-50 transition-opacity",
  danger:      "px-4 py-2 rounded-lg bg-red-600 text-white text-sm font-medium hover:bg-red-700 disabled:opacity-50 transition-colors",
  ghostGold:   "px-3 py-1.5 rounded-lg text-xs font-medium text-[#C9A24B] border border-[#C9A24B]/30 hover:bg-[#C9A24B]/10 transition-colors disabled:opacity-50",
  ghostDanger: "px-3 py-1.5 rounded-lg text-xs font-medium text-red-500 border border-red-200 hover:bg-red-50 transition-colors disabled:opacity-50",
};

export const input =
  "w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#C9A24B]/40 bg-white";

export const label = "block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1.5";

// ─── Components ───────────────────────────────────────────────────────────────

export function StatCard({ title, value, sub, icon, accent = "#0B1F2A", loading }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex items-start gap-4">
      <div
        className="w-11 h-11 rounded-xl flex items-center justify-center text-xl shrink-0"
        style={{ backgroundColor: `${accent}18` }}
      >
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">{title}</p>
        <p className="text-2xl font-serif text-[#0B1F2A]">{loading ? "…" : value}</p>
        {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

export function TableCard({ children }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden overflow-x-auto">
      {children}
    </div>
  );
}

export function Th({ children }) {
  return (
    <th className="px-4 py-3 text-xs font-medium text-gray-400 uppercase tracking-wide whitespace-nowrap text-left">
      {children}
    </th>
  );
}

const BADGE_STYLES = {
  paid:           "bg-green-100 text-green-700",
  confirmed:      "bg-green-100 text-green-700",
  resolved:       "bg-green-100 text-green-700",
  active:         "bg-green-100 text-green-700",
  "checked-in":   "bg-blue-100 text-blue-700",
  "checked-out":  "bg-gray-100 text-gray-600",
  inactive:       "bg-gray-200 text-gray-500",
  pending:        "bg-yellow-100 text-yellow-700",
  "in-progress":  "bg-yellow-100 text-yellow-700",
  open:           "bg-red-100 text-red-600",
  cancelled:      "bg-red-100 text-red-600",
};

export function Badge({ value }) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${
        BADGE_STYLES[value] ?? "bg-gray-100 text-gray-600"
      }`}
    >
      {value?.replace(/-/g, " ")}
    </span>
  );
}

export function Pills({ options, value, onChange }) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
            value === opt.value
              ? "bg-[#0B1F2A] text-white"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

export function Spinner() {
  return (
    <div className="flex justify-center py-12">
      <div className="w-8 h-8 border-4 border-gray-200 border-t-[#C9A24B] rounded-full animate-spin" />
    </div>
  );
}

export function ErrorBanner({ children, onRetry }) {
  if (!children) return null;
  return (
    <div className="mb-4 flex items-center justify-between gap-3 rounded-lg bg-red-50 border border-red-100 px-4 py-3 text-sm text-red-700">
      <span>{children}</span>
      {onRetry && (
        <button onClick={onRetry} className="text-xs underline text-red-600 hover:text-red-800 shrink-0">
          Retry
        </button>
      )}
    </div>
  );
}

export function SuccessBanner({ children }) {
  if (!children) return null;
  return (
    <div className="mb-4 rounded-lg bg-green-50 border border-green-100 px-4 py-3 text-sm text-green-700">
      {children}
    </div>
  );
}

export function EmptyState({ icon, title, subtitle, action }) {
  return (
    <div className="py-16 flex flex-col items-center gap-3 text-center">
      <span className="text-4xl">{icon}</span>
      <p className="font-medium text-gray-700">{title}</p>
      {subtitle && <p className="text-sm text-gray-400 max-w-xs">{subtitle}</p>}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}

export function Modal({ title, children, onClose, footer, size = "max-w-md" }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className={`bg-white rounded-xl shadow-2xl w-full ${size} flex flex-col max-h-[90vh]`}>
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between shrink-0">
          <h3 className="text-lg font-serif text-[#0B1F2A]">{title}</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-xl leading-none"
            aria-label="Close"
          >
            ✕
          </button>
        </div>
        <div className="px-6 py-5 space-y-4 overflow-y-auto flex-1">{children}</div>
        {footer && (
          <div className="px-6 py-4 border-t border-gray-100 flex gap-3 justify-end shrink-0">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
