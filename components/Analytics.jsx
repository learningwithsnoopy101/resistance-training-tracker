import React, { useMemo, useState, useEffect } from 'react';
import { ProgressChart } from '@/components/ProgressChart';
import { ProgressTable } from '@/components/ProgressTable';
import { MuscleHeatmap } from '@/components/MuscleHeatmap';
import { InsightCard } from '@/components/InsightCard';
import {
  groupSessionsByExercise,
  trackedExercises,
  isBodyweight,
  buildChartPoints,
  sessionsInTrailingDays,
  consistencyStreak,
  winsForWeek,
  trainingDaysByWeek,
  weekStart,
  shiftDate,
  MIN_SESSIONS,
  WEEKLY_TARGET,
} from '@/lib/progress';

const MODES = [
  { key: 'weight', label: 'Working weight' },
  { key: 'e1rm', label: 'Estimated 1RM' },
];

function ModeToggle({ mode, onChange }) {
  return (
    <div className="inline-flex gap-1 rounded-input bg-beige p-1 border-[0.5px] border-taupe">
      {MODES.map(m => (
        <button
          key={m.key}
          onClick={() => onChange(m.key)}
          className={`px-3 py-1 text-tiny font-medium rounded-input transition ${
            mode === m.key ? 'bg-cream text-ink shadow-tab' : 'text-ink-muted hover:text-ink'
          }`}
        >
          {m.label}
        </button>
      ))}
    </div>
  );
}

function KpiCard({ label, value, hint, onClick, expanded, detail }) {
  return (
    <div
      className={`bg-cream rounded-card shadow-card border-[0.5px] border-taupe p-4 ${
        onClick ? 'cursor-pointer hover:bg-beige transition' : ''
      }`}
      onClick={onClick}
    >
      <p className="text-micro font-medium text-ink-muted uppercase tracking-micro">{label}</p>
      <p className="text-h1-warm text-ink mt-2">{value}</p>
      {hint && <p className="text-tiny text-ink-muted mt-1">{hint}</p>}
      {expanded && detail && <p className="text-tiny text-ink mt-2">{detail}</p>}
    </div>
  );
}

export function Analytics({ exercises = [], exerciseLibrary = [], insights = [] }) {
  const [selected, setSelected] = useState(null);
  const [mode, setMode] = useState('weight');
  const [winsExpanded, setWinsExpanded] = useState(false);

  const sessionsByName = useMemo(() => groupSessionsByExercise(exercises), [exercises]);
  const tracked = useMemo(() => trackedExercises(sessionsByName), [sessionsByName]);

  // Default to the most recently trained tracked exercise; heal stale selections
  useEffect(() => {
    if (!selected || !tracked.includes(selected)) {
      setSelected(tracked[0] || null);
    }
  }, [tracked, selected]);

  const sessions = selected ? sessionsByName.get(selected) || [] : [];
  const bodyweight = sessions.length > 0 && isBodyweight(sessions);
  const points = useMemo(
    () => (sessions.length ? buildChartPoints(sessions, bodyweight ? 'weight' : mode) : []),
    [sessions, mode, bodyweight]
  );

  const recentCount = sessionsInTrailingDays(exercises, 56);
  const exerciseType = sessions[0]?.type;

  // KPIs + weekly pulse
  const todayStr = new Date().toISOString().slice(0, 10);
  const currentWeek = weekStart(todayStr);
  const streak = useMemo(() => consistencyStreak(exercises), [exercises]);
  const thisWeekWins = useMemo(
    () => winsForWeek(sessionsByName, currentWeek),
    [sessionsByName, currentWeek]
  );
  const lastWeekWins = useMemo(
    () => winsForWeek(sessionsByName, shiftDate(currentWeek, -7)),
    [sessionsByName, currentWeek]
  );
  const daysThisWeek = trainingDaysByWeek(exercises).get(currentWeek)?.size || 0;
  const hitTarget = daysThisWeek >= WEEKLY_TARGET;

  // Latest cached LLM insights (insights arrive sorted newest first)
  const digest = insights.find(i => i.kind === 'digest');
  const muscleInsight = insights.find(i => i.kind === 'muscle_insight');

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-h1-warm text-ink">Progress</h1>
        <p className="text-tiny text-ink-muted mt-1">
          Last 8 weeks · {recentCount} session{recentCount !== 1 ? 's' : ''} logged
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
        <KpiCard
          label="Consistency streak"
          value={`${streak} week${streak !== 1 ? 's' : ''}`}
          hint={`of ${WEEKLY_TARGET}+ sessions`}
        />
        <KpiCard
          label="This week's wins"
          value={thisWeekWins.length}
          hint={
            thisWeekWins.length > 0
              ? `exercise${thisWeekWins.length !== 1 ? 's' : ''} improved · tap to ${winsExpanded ? 'hide' : 'see'}`
              : 'exercises improved this week'
          }
          onClick={thisWeekWins.length > 0 ? () => setWinsExpanded(v => !v) : undefined}
          expanded={winsExpanded}
          detail={thisWeekWins.join(', ')}
        />
        <KpiCard
          label="Active progression set"
          value={tracked.length}
          hint={`exercises with ${MIN_SESSIONS}+ sessions`}
        />
      </div>

      <div className="bg-cream rounded-card shadow-card border-[0.5px] border-taupe p-5">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div>
            <h2 className="text-h2-warm text-ink">Per-exercise progression</h2>
            <p className="text-tiny text-ink-muted mt-0.5">
              One point per session · gold dots are PRs · small numbers are reps
            </p>
          </div>
          {tracked.length > 0 && (
            <div className="flex flex-wrap items-center gap-3">
              <select
                value={selected || ''}
                onChange={e => setSelected(e.target.value)}
                className="rounded-input border-[0.5px] border-taupe bg-cream text-sm-warm text-ink px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-lower-body"
              >
                {tracked.map(name => (
                  <option key={name} value={name}>
                    {name} ({sessionsByName.get(name).length})
                  </option>
                ))}
              </select>
              {bodyweight ? (
                <span className="text-tiny text-ink-muted">tracking reps (bodyweight)</span>
              ) : (
                <ModeToggle mode={mode} onChange={setMode} />
              )}
            </div>
          )}
        </div>

        {tracked.length === 0 ? (
          <div className="h-40 rounded-input bg-beige flex items-center justify-center px-6 text-center">
            <p className="text-tiny text-ink-muted">
              Progression charts unlock once an exercise has {MIN_SESSIONS}+ logged sessions —
              keep logging and this will fill in.
            </p>
          </div>
        ) : points.length < 2 ? (
          <div className="h-40 rounded-input bg-beige flex items-center justify-center px-6 text-center">
            <p className="text-tiny text-ink-muted">
              Not enough weighted sessions to chart this exercise yet.
            </p>
          </div>
        ) : (
          <ProgressChart points={points} type={exerciseType} />
        )}
      </div>

      <div className="mt-4">
        <ProgressTable sessionsByName={sessionsByName} exerciseLibrary={exerciseLibrary} />
      </div>

      <div className="mt-4">
        <InsightCard
          title="This week's digest"
          insight={digest}
          emptyHint="No digest yet — it generates Sunday evenings, or ask Claude to refresh it."
        />
      </div>

      <div className="mt-4">
        <MuscleHeatmap exercises={exercises} exerciseLibrary={exerciseLibrary} />
      </div>

      <div className="mt-4">
        <InsightCard
          title="Coach's read on muscle coverage"
          insight={muscleInsight}
          emptyHint="No insight yet — it generates Sunday evenings alongside the digest."
        />
      </div>

      {/* Weekly pulse — honest one-glance summary */}
      <div className="bg-cream rounded-card shadow-card border-[0.5px] border-taupe p-5 mt-4">
        <h2 className="text-h2-warm text-ink mb-3">Weekly pulse</h2>
        <div className="space-y-1.5">
          <p className="text-xs-warm text-ink">
            {thisWeekWins.length > 0 ? (
              <>This week: {thisWeekWins.length} exercise{thisWeekWins.length !== 1 ? 's' : ''} improved — {thisWeekWins.join(', ')}</>
            ) : (
              <>No new progress this week — muscle adaptation isn't linear, keep going</>
            )}
          </p>
          <p className="text-xs-warm text-ink-muted">
            Week before: {lastWeekWins.length} exercise{lastWeekWins.length !== 1 ? 's' : ''} improved
          </p>
          <p className="text-xs-warm text-ink-muted">
            Consistency: {daysThisWeek} session{daysThisWeek !== 1 ? 's' : ''} this week
            (target: {WEEKLY_TARGET}+){hitTarget && <span className="text-lower-body-ink"> ✓</span>}
          </p>
        </div>
      </div>
    </div>
  );
}
