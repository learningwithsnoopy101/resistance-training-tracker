import React, { useState, useEffect } from 'react';

const EXERCISE_TYPES = ['Upper Body', 'Lower Body', 'Abs', 'Peak 8'];

const EMPTY_FORM = () => ({
  name: '',
  type: '',
  date: new Date().toISOString().split('T')[0],
  sets: 3,
  reps: 10,
  weight: '',
  unit: 'lbs',
  isMaxWeight: false,
  isMaxReps: false,
  focus: '',
  notes: '',
});

function parseQuickEntry(text) {
  const cols = text.split(',').map(s => s.trim());
  if (cols.length < 3) return null;

  const type = cols[0];
  const name = cols[1];
  if (!type || !name) return null;

  // Sets x Reps
  let sets = 3, reps = 10;
  const srMatch = cols[2].match(/(\d+)\s*x\s*(\d+)/i);
  if (!srMatch) return null;
  sets = parseInt(srMatch[1]);
  reps = parseInt(srMatch[2]);

  // Weight (optional)
  let weight = '', unit = 'lbs';
  if (cols[3]) {
    const wMatch = cols[3].match(/([\d.]+)\s*(lbs|kg)/i);
    if (wMatch) {
      weight = wMatch[1];
      unit = wMatch[2].toLowerCase();
    }
  }

  // Focus (optional)
  const focus = cols[4] && !/max/i.test(cols[4]) ? cols[4] : '';

  // Max flags — check all remaining cols
  const remaining = cols.slice(4).join(' ').toLowerCase();
  const isMaxWeight = remaining.includes('max weight');
  const isMaxReps = remaining.includes('max reps');

  return {
    name, type,
    date: new Date().toISOString().split('T')[0],
    sets, reps, weight, unit, focus,
    isMaxWeight, isMaxReps, notes: '',
  };
}

// Shared input class — reused across all text/number/date inputs
const inputBase = 'w-full px-3 py-2 bg-cream border-[0.5px] border-taupe rounded-input text-sm-warm text-ink placeholder:text-ink-muted focus:outline-none focus:ring-2 focus:ring-lower-body focus:border-lower-body transition';
const inputError = 'border-warn-fill';

export default function ExerciseForm({ onSubmit, editingData, onCancelEdit, copyData, onCopyConsumed, exerciseLibrary = [] }) {
  const [mode, setMode] = useState('quick'); // 'quick' | 'full'
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});

  // Quick entry state
  const [quickText, setQuickText] = useState('');
  const [quickError, setQuickError] = useState('');
  const [quickDate, setQuickDate] = useState(new Date().toISOString().split('T')[0]);

  // When editing, switch to full form
  useEffect(() => {
    if (editingData) {
      setFormData(editingData);
      setErrors({});
      setMode('full');
    }
  }, [editingData]);

  // When copying, pre-fill current mode
  useEffect(() => {
    if (copyData) {
      if (mode === 'quick') {
        const parts = [copyData.type, copyData.name, `${copyData.sets}x${copyData.reps}`];
        if (copyData.weight) parts.push(`${copyData.weight}${copyData.unit}`);
        if (copyData.focus) parts.push(copyData.focus);
        if (copyData.isMaxWeight) parts.push('max weight');
        if (copyData.isMaxReps) parts.push('max reps');
        setQuickText(parts.join(', '));
      } else {
        setFormData({
          ...EMPTY_FORM(),
          name: copyData.name,
          type: copyData.type,
          sets: copyData.sets,
          reps: copyData.reps,
          weight: copyData.weight,
          unit: copyData.unit,
          focus: copyData.focus || '',
          isMaxWeight: copyData.isMaxWeight,
          isMaxReps: copyData.isMaxReps,
        });
      }
      onCopyConsumed();
    }
  }, [copyData]);

  // Full form handlers
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Exercise name is required';
    if (!formData.type) newErrors.type = 'Exercise type is required';
    if (!formData.date) newErrors.date = 'Date is required';
    if (!formData.sets || formData.sets < 1) newErrors.sets = 'Sets must be at least 1';
    if (!formData.reps || formData.reps < 1) newErrors.reps = 'Reps must be at least 1';
    if (formData.weight && isNaN(formData.weight)) newErrors.weight = 'Weight must be a number';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleFullSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
      setFormData(EMPTY_FORM());
      setErrors({});
    }
  };

  const handleCancel = () => {
    setFormData(EMPTY_FORM());
    setErrors({});
    setQuickText('');
    setQuickError('');
    onCancelEdit();
  };

  // Quick entry handler
  const handleQuickSubmit = (e) => {
    e.preventDefault();
    const parsed = parseQuickEntry(quickText);
    if (!parsed) {
      setQuickError('Could not parse. Use: Type, Name, SetsxReps, Weight, Focus, Max flag');
      return;
    }
    onSubmit({ ...parsed, date: quickDate });
    setQuickText('');
    setQuickError('');
    setQuickDate(new Date().toISOString().split('T')[0]);
  };

  const isEditing = !!editingData;

  return (
    <div className="bg-cream rounded-card shadow-card border-[0.5px] border-taupe p-6">
      {/* Header + toggle */}
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-h1-warm text-ink">
          {isEditing ? 'Edit exercise' : 'Log exercise'}
        </h2>
        {!isEditing && (
          <div className="flex rounded-input border-[0.5px] border-taupe overflow-hidden text-sm-warm">
            <button
              type="button"
              onClick={() => setMode('quick')}
              className={`px-3 py-1.5 font-medium transition ${
                mode === 'quick' ? 'bg-ink text-cream' : 'text-ink-muted hover:bg-beige'
              }`}
            >
              Quick
            </button>
            <button
              type="button"
              onClick={() => setMode('full')}
              className={`px-3 py-1.5 font-medium transition ${
                mode === 'full' ? 'bg-ink text-cream' : 'text-ink-muted hover:bg-beige'
              }`}
            >
              Full form
            </button>
          </div>
        )}
      </div>

      {/* Quick entry */}
      {mode === 'quick' && !isEditing && (
        <form onSubmit={handleQuickSubmit} className="space-y-3">
          <div>
            <label className="block text-tiny font-medium text-ink-muted mb-1">Pick an exercise (optional)</label>
            <select
              onChange={e => {
                const ex = exerciseLibrary.find(x => x.name === e.target.value);
                if (ex) setQuickText(`${ex.type}, ${ex.name}, `);
                e.target.value = '';
              }}
              className={inputBase}
              defaultValue=""
            >
              <option value="" disabled>Select exercise to pre-fill...</option>
              {['Lower Body', 'Upper Body', 'Abs', 'Peak 8'].map(type => (
                <optgroup key={type} label={type}>
                  {exerciseLibrary.filter(ex => ex.type === type).map(ex => (
                    <option key={ex.name} value={ex.name}>{ex.name}</option>
                  ))}
                </optgroup>
              ))}
            </select>
          </div>
          <p className="text-tiny text-ink-muted">
            Format: <span className="font-mono">Type, Name, SetsxReps, Weight, Focus, Max flag</span>
          </p>
          <textarea
            value={quickText}
            onChange={e => { setQuickText(e.target.value); setQuickError(''); }}
            placeholder="Lower Body, Squats, 3x10, 135lbs, Push, max weight"
            rows={3}
            className={`${inputBase} font-mono resize-none ${quickError ? inputError : ''}`}
          />
          {quickError && <p className="text-warn-ink text-tiny">{quickError}</p>}
          <div>
            <label className="block text-tiny font-medium text-ink-muted mb-1">Date (defaults to today)</label>
            <input
              type="date"
              value={quickDate}
              onChange={e => setQuickDate(e.target.value)}
              className={inputBase}
            />
          </div>
          <button
            type="submit"
            disabled={!quickText.trim()}
            className="w-full bg-ink hover:opacity-90 disabled:opacity-50 text-cream font-medium py-2 px-4 rounded-input transition focus:outline-none focus:ring-2 focus:ring-lower-body"
          >
            Log exercise
          </button>
        </form>
      )}

      {/* Full form */}
      {(mode === 'full' || isEditing) && (
        <form onSubmit={handleFullSubmit} className="space-y-5">
          <div>
            <label className="block text-xs-warm font-medium text-ink mb-1">Pick an exercise (optional)</label>
            <select
              onChange={e => {
                const ex = exerciseLibrary.find(x => x.name === e.target.value);
                if (ex) setFormData(prev => ({ ...prev, name: ex.name, type: ex.type }));
                e.target.value = '';
              }}
              className={inputBase}
              defaultValue=""
            >
              <option value="" disabled>Select exercise to pre-fill...</option>
              {['Lower Body', 'Upper Body', 'Abs', 'Peak 8'].map(type => (
                <optgroup key={type} label={type}>
                  {exerciseLibrary.filter(ex => ex.type === type).map(ex => (
                    <option key={ex.name} value={ex.name}>{ex.name}</option>
                  ))}
                </optgroup>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="name" className="block text-xs-warm font-medium text-ink mb-1">
              Exercise name <span className="text-warn-ink">*</span>
            </label>
            <input
              id="name" type="text" name="name" value={formData.name}
              onChange={handleChange} placeholder="e.g., Bench Press"
              className={`${inputBase} ${errors.name ? inputError : ''}`}
            />
            {errors.name && <p className="text-warn-ink text-xs-warm mt-1">{errors.name}</p>}
          </div>

          <div>
            <label htmlFor="type" className="block text-xs-warm font-medium text-ink mb-1">
              Type <span className="text-warn-ink">*</span>
            </label>
            <select
              id="type" name="type" value={formData.type} onChange={handleChange}
              className={`${inputBase} ${errors.type ? inputError : ''}`}
            >
              <option value="">Select a type</option>
              {EXERCISE_TYPES.map(type => <option key={type} value={type}>{type}</option>)}
            </select>
            {errors.type && <p className="text-warn-ink text-xs-warm mt-1">{errors.type}</p>}
          </div>

          <div>
            <label htmlFor="date" className="block text-xs-warm font-medium text-ink mb-1">
              Date <span className="text-warn-ink">*</span>
            </label>
            <input
              id="date" type="date" name="date" value={formData.date} onChange={handleChange}
              className={`${inputBase} ${errors.date ? inputError : ''}`}
            />
            {errors.date && <p className="text-warn-ink text-xs-warm mt-1">{errors.date}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="sets" className="block text-xs-warm font-medium text-ink mb-1">
                Sets <span className="text-warn-ink">*</span>
              </label>
              <input
                id="sets" type="number" name="sets" value={formData.sets}
                onChange={handleChange} min="1"
                className={`${inputBase} ${errors.sets ? inputError : ''}`}
              />
              {errors.sets && <p className="text-warn-ink text-xs-warm mt-1">{errors.sets}</p>}
            </div>
            <div>
              <label htmlFor="reps" className="block text-xs-warm font-medium text-ink mb-1">
                Reps <span className="text-warn-ink">*</span>
              </label>
              <input
                id="reps" type="number" name="reps" value={formData.reps}
                onChange={handleChange} min="1"
                className={`${inputBase} ${errors.reps ? inputError : ''}`}
              />
              {errors.reps && <p className="text-warn-ink text-xs-warm mt-1">{errors.reps}</p>}
            </div>
          </div>

          <div>
            <label htmlFor="weight" className="block text-xs-warm font-medium text-ink mb-1">
              Weight (optional)
            </label>
            <div className="flex gap-2">
              <input
                id="weight" type="number" name="weight" value={formData.weight}
                onChange={handleChange} placeholder="0" step="0.5"
                className={`flex-1 px-3 py-2 bg-cream border-[0.5px] border-taupe rounded-input text-sm-warm text-ink placeholder:text-ink-muted focus:outline-none focus:ring-2 focus:ring-lower-body focus:border-lower-body transition ${errors.weight ? inputError : ''}`}
              />
              <select name="unit" value={formData.unit} onChange={handleChange}
                className="px-3 py-2 bg-cream border-[0.5px] border-taupe rounded-input text-sm-warm text-ink focus:outline-none focus:ring-2 focus:ring-lower-body focus:border-lower-body transition">
                <option value="lbs">lbs</option>
                <option value="kg">kg</option>
              </select>
            </div>
            {errors.weight && <p className="text-warn-ink text-xs-warm mt-1">{errors.weight}</p>}
          </div>

          <div className="space-y-3 pt-2">
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" name="isMaxWeight" checked={formData.isMaxWeight}
                onChange={handleChange}
                className="w-4 h-4 rounded border-taupe text-lower-body focus:ring-2 focus:ring-lower-body cursor-pointer"
              />
              <span className="text-xs-warm text-ink">Max weight</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" name="isMaxReps" checked={formData.isMaxReps}
                onChange={handleChange}
                className="w-4 h-4 rounded border-taupe text-lower-body focus:ring-2 focus:ring-lower-body cursor-pointer"
              />
              <span className="text-xs-warm text-ink">Max reps</span>
            </label>
          </div>

          <div>
            <label htmlFor="focus" className="block text-xs-warm font-medium text-ink mb-1">
              Focus (optional)
            </label>
            <input
              id="focus" type="text" name="focus" value={formData.focus}
              onChange={handleChange} placeholder="e.g. Push, Pull, Compound"
              className={inputBase}
            />
          </div>

          <div>
            <label htmlFor="notes" className="block text-xs-warm font-medium text-ink mb-1">
              Notes (optional)
            </label>
            <textarea
              id="notes" name="notes" value={formData.notes}
              onChange={handleChange} placeholder="Add any notes about this exercise..."
              rows="3"
              className={`${inputBase} resize-none`}
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button type="submit"
              className="flex-1 bg-ink hover:opacity-90 text-cream font-medium py-2 px-4 rounded-input transition focus:outline-none focus:ring-2 focus:ring-lower-body"
            >
              {isEditing ? 'Update exercise' : 'Log exercise'}
            </button>
            {isEditing && (
              <button type="button" onClick={handleCancel}
                className="flex-1 bg-beige hover:bg-taupe text-ink font-medium py-2 px-4 rounded-input transition focus:outline-none focus:ring-2 focus:ring-lower-body"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      )}
    </div>
  );
}
