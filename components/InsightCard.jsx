import React from 'react';

function formatGenerated(iso) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

// Renders one cached LLM insight (digest or muscle insight) from the
// `insights` table. Content is generated weekly by the GitHub Actions cron;
// honest empty state when nothing has been generated yet.
export function InsightCard({ title, insight, emptyHint }) {
  return (
    <div className="bg-cream rounded-card shadow-card border-[0.5px] border-taupe p-5">
      <div className="flex items-baseline justify-between gap-3 mb-2">
        <h2 className="text-h2-warm text-ink">{title}</h2>
        {insight && (
          <span className="text-tiny text-ink-muted whitespace-nowrap">
            generated {formatGenerated(insight.generatedAt)}
          </span>
        )}
      </div>
      {insight ? (
        <p className="text-xs-warm text-ink leading-relaxed">{insight.content}</p>
      ) : (
        <p className="text-tiny text-ink-muted">{emptyHint}</p>
      )}
    </div>
  );
}
