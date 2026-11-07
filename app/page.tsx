import Link from 'next/link';

const flagship = {
  href: '/leaklens',
  label: 'LeakLens AI Command Center',
  detail: 'Autonomous Revenue Leak Investigator (PayPal + AG Grid + AG Studio)',
  badge: 'Flagship Submission',
};

const dashboard = {
  href: '/dashboard',
  label: 'AG Studio Dashboard',
  detail: 'AG Studio embedded self-service analytics & reports',
};

// One page per PayPal endpoint the demo calls, each in app/(endpoints).
const endpoints = [
  { href: '/products', label: 'Catalog products', detail: 'GET /v1/catalogs/products' },
  { href: '/plans', label: 'Billing plans', detail: 'GET /v1/billing/plans' },
  { href: '/invoices', label: 'Invoices', detail: 'GET /v2/invoicing/invoices' },
  { href: '/transactions', label: 'Transactions', detail: 'GET /v1/reporting/transactions' },
  { href: '/balances', label: 'Balances', detail: 'GET /v1/reporting/balances' },
];

function PageLink({
  href,
  label,
  detail,
  badge,
}: {
  href: string;
  label: string;
  detail: string;
  badge?: string;
}) {
  return (
    <li>
      <Link
        href={href}
        className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 py-4 hover:text-pp-blue transition-colors group"
      >
        <div className="flex items-center gap-2">
          <span className="font-semibold text-base group-hover:translate-x-1 transition-transform">
            {label} →
          </span>
          {badge && (
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-cyan-100 text-cyan-800 border border-cyan-300">
              {badge}
            </span>
          )}
        </div>
        <code className="text-xs text-pp-muted font-mono">{detail}</code>
      </Link>
    </li>
  );
}

export default function Home() {
  return (
    <main className="mx-auto w-full max-w-3xl p-8 sm:p-16 font-paypal text-pp-ink">
      <div className="mb-8">
        <span className="text-xs font-bold uppercase tracking-widest text-cyan-700">
          PayPal AI Hackathon 2026 • AG Grid Sponsor Track
        </span>
        <h1 className="text-[32px] font-bold text-pp-navy mt-1 tracking-tight">
          LeakLens AI &amp; PayPal REST Studio
        </h1>
        <p className="text-sm text-pp-muted mt-2 leading-relaxed">
          Autonomous revenue leakage detection, baseline drift analysis, and deterministic evidence
          investigation powered by PayPal Developer APIs and AG Grid / AG Studio.
        </p>
      </div>

      <div className="mb-6 p-4 rounded-xl bg-slate-900 text-white shadow-xl flex items-center justify-between">
        <div>
          <span className="text-[11px] font-mono text-cyan-400 uppercase font-semibold">
            Recommended Hackathon Demo
          </span>
          <h2 className="text-lg font-bold text-white mt-0.5">Launch LeakLens AI</h2>
          <p className="text-xs text-slate-300 mt-0.5">
            Interactive AI investigation console with AG Grid evidence ledger
          </p>
        </div>
        <Link
          href="/leaklens"
          className="px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition-colors shrink-0"
        >
          Open App →
        </Link>
      </div>

      <h2 className="mt-8 text-xs font-semibold uppercase tracking-wider text-pp-muted">
        Platforms &amp; Studios
      </h2>
      <ul className="mt-2 divide-y divide-pp-border border-y border-pp-border">
        <PageLink {...flagship} />
        <PageLink {...dashboard} />
      </ul>

      <h2 className="mt-10 text-xs font-semibold uppercase tracking-wider text-pp-muted">
        Raw PayPal API Endpoints (AG Grids)
      </h2>
      <ul className="mt-2 divide-y divide-pp-border border-y border-pp-border">
        {endpoints.map((page) => (
          <PageLink key={page.href} {...page} />
        ))}
      </ul>
    </main>
  );
}
