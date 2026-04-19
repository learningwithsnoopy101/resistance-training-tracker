import React from 'react';

function KpiCard({ label, value, hint }) {
  return (
    <div className="bg-cream rounded-card shadow-card border-[0.5px] border-taupe p-4">
      <p className="text-micro font-medium text-ink-muted uppercase tracking-micro">{label}</p>
      <p className="text-h1-warm text-ink mt-2">{value}</p>
      {hint && <p className="text-tiny text-ink-muted mt-1">{hint}</p>}
    </div>
  );
}

function ChartPlaceholder({ title, subtitle }) {
  return (
    <div className="bg-cream rounded-card shadow-card border-[0.5px] border-taupe p-5">
      <h3 className="text-h3-warm text-ink">{title}</h3>
      {subtitle && <p className="text-tiny text-ink-muted mt-1">{subtitle}</p>}
      <div className="mt-4 h-40 rounded-input bg-beige border border-dashed border-taupe-emphasis flex items-center justify-center">
        <span className="text-tiny text-ink-muted">Chart coming in step 5</span>
      </div>
    </div>
  );
}

export default function Analytics({ exercises = [] }) {
  const sessionCount = exercises.length;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-h1-warm text-ink">Analytics</h1>
        <p className="text-tiny text-ink-muted mt-1">
          Last 8 weeks · {sessionCount} session{sessionCount !== 1 ? 's' : ''} logged
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <KpiCard label="Total volume" value="—" hint="Coming soon" />
        <KpiCard label="Sessions / week" value="—" hint="Coming soon" />
        <KpiCard label="Personal records" value="—" hint="Coming soon" />
        <KpiCard label="Variety score" value="—" hint="Coming soon" />
      </div>

      <div className="space-y-4">
        <ChartPlaceholder
          title="Muscle group coverage"
          subtitle="Sessions this week vs 2× target per muscle"
        />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <ChartPlaceholder
            title="Weight progression"
            subtitle="Per exercise over last 8-12 weeks"
          />
          <ChartPlaceholder
            title="Push vs Pull balance"
            subtitle="Week-to-date ratio"
          />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <ChartPlaceholder
            title="Compound vs Isolation"
            subtitle="~60/40 target"
          />
          <ChartPlaceholder
            title="PR timeline"
            subtitle="Personal records over time"
          />
        </div>
      </div>
    </div>
  );
}
