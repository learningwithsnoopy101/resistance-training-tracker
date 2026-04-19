import React, { useState } from 'react';

const EXERCISE_TYPES = ['Upper Body', 'Lower Body', 'Abs', 'Peak 8'];

function parseLine(line) {
  // Format: Type, Exercise Name, Date, SetsxReps, Weight, Max flag
  const cols = line.split(',').map(s => s.trim());
  if (cols.length < 4) return null;

  const type = cols[0];
  const name = cols[1];

  if (!type || !name) return null;

  // Date: "4/10" -> "2026-04-10"
  const dateParts = cols[2].match(/(\d+)\/(\d+)/);
  let date = new Date().toISOString().split('T')[0];
  if (dateParts) {
    const month = dateParts[1].padStart(2, '0');
    const day = dateParts[2].padStart(2, '0');
    date = `2026-${month}-${day}`;
  }

  // Sets x Reps: "3x10", "3 x 10", "3   x 10"
  let sets = 3, reps = 10;
  const srMatch = cols[3].match(/(\d+)\s*x\s*(\d+)/i);
  if (srMatch) {
    sets = parseInt(srMatch[1]);
    reps = parseInt(srMatch[2]);
  }

  // Weight: "40lbs", "27.5lbs", "110 lbs"
  let weight = '', unit = 'lbs';
  if (cols[4]) {
    const wMatch = cols[4].match(/([\d.]+)\s*(lbs|kg)/i);
    if (wMatch) {
      weight = wMatch[1];
      unit = wMatch[2].toLowerCase();
    }
  }

  // Max flags
  const maxField = (cols[5] || '').toLowerCase();
  const isMaxWeight = maxField.includes('max weight');
  const isMaxReps = maxField.includes('max reps');

  return { name, type, date, sets, reps, weight, unit, isMaxWeight, isMaxReps, notes: '' };
}

export default function BulkImport({ onImport }) {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState('');
  const [parsed, setParsed] = useState(null);
  const [error, setError] = useState('');

  const handleParse = () => {
    const lines = text.split('\n').filter(l => l.trim());
    const results = [];
    const skipped = [];

    for (const line of lines) {
      // Skip header line
      if (/^exercise/i.test(line.trim())) continue;
      const result = parseLine(line);
      if (result) results.push(result);
      else if (line.trim()) skipped.push(line.trim());
    }

    if (results.length === 0) {
      setError('No exercises could be parsed. Make sure your data uses tabs between the name and the rest.');
      setParsed(null);
      return;
    }

    setError(skipped.length > 0 ? `${skipped.length} line(s) could not be parsed and were skipped.` : '');
    setParsed(results);
  };

  const handleTypeChange = (idx, type) => {
    setParsed(prev => prev.map((ex, i) => i === idx ? { ...ex, type } : ex));
  };

  const handleImport = () => {
    onImport(parsed);
    setOpen(false);
    setText('');
    setParsed(null);
    setError('');
  };

  const handleClose = () => {
    setOpen(false);
    setText('');
    setParsed(null);
    setError('');
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="w-full bg-beige hover:bg-taupe text-ink font-medium py-2 px-4 rounded-input transition focus:outline-none focus:ring-2 focus:ring-lower-body"
      >
        Bulk import from notepad
      </button>

      {open && (
        <div className="fixed inset-0 bg-ink/40 flex items-center justify-center z-50 p-4">
          <div className="bg-cream rounded-card shadow-card border-[0.5px] border-taupe w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-h1-warm text-ink">Bulk import exercises</h2>
                <button onClick={handleClose} className="text-ink-muted hover:text-ink text-2xl leading-none">&times;</button>
              </div>

              <p className="text-xs-warm text-ink-muted mb-3">
                Paste your notepad data below. Expected format per line:<br />
                <code className="bg-beige px-1 rounded-input text-tiny">Type, Exercise Name, Date, SetsxReps, Weight, Max flag</code>
              </p>

              <textarea
                value={text}
                onChange={e => { setText(e.target.value); setParsed(null); setError(''); }}
                rows={6}
                placeholder={"Lower Body, Dumbbell Lunges, 4/10, 3x10, 40lbs, max weight"}
                className="w-full px-3 py-2 bg-cream border-[0.5px] border-taupe rounded-input font-mono text-sm-warm text-ink placeholder:text-ink-muted focus:outline-none focus:ring-2 focus:ring-lower-body focus:border-lower-body resize-none"
              />

              <button
                onClick={handleParse}
                disabled={!text.trim()}
                className="mt-3 bg-ink hover:opacity-90 disabled:opacity-50 text-cream font-medium py-2 px-4 rounded-input transition focus:outline-none focus:ring-2 focus:ring-lower-body"
              >
                Parse
              </button>

              {error && <p className="mt-3 text-xs-warm text-warn-ink">{error}</p>}

              {parsed && (
                <div className="mt-5">
                  <p className="text-xs-warm font-medium text-ink mb-3">
                    {parsed.length} exercise{parsed.length !== 1 ? 's' : ''} found — assign a type to each:
                  </p>
                  <div className="space-y-2">
                    {parsed.map((ex, idx) => (
                      <div key={idx} className="flex items-center gap-3 p-3 bg-beige rounded-input">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-ink text-xs-warm truncate">{ex.name}</p>
                          <p className="text-tiny text-ink-muted">
                            {ex.type} &middot; {ex.date} &middot; {ex.sets}x{ex.reps}
                            {ex.weight ? ` · ${ex.weight}${ex.unit}` : ''}
                            {ex.isMaxWeight ? ' · Max W' : ''}
                            {ex.isMaxReps ? ' · Max R' : ''}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="flex gap-3 mt-5">
                    <button
                      onClick={handleImport}
                      className="flex-1 bg-ink hover:opacity-90 text-cream font-medium py-2 px-4 rounded-input transition focus:outline-none focus:ring-2 focus:ring-lower-body"
                    >
                      Import {parsed.length} exercise{parsed.length !== 1 ? 's' : ''}
                    </button>
                    <button
                      onClick={handleClose}
                      className="flex-1 bg-beige hover:bg-taupe text-ink font-medium py-2 px-4 rounded-input transition"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
