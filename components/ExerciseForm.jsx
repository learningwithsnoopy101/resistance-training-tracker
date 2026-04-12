import React, { useState, useEffect } from 'react';
import { PREDEFINED_EXERCISES } from '@/lib/exercises';

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

export default function ExerciseForm({ onSubmit, editingData, onCancelEdit }) {
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
    <div className="bg-white rounded-lg shadow-md p-6">
      {/* Header + toggle */}
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-xl font-bold text-gray-900">
          {isEditing ? 'Edit Exercise' : 'Log Exercise'}
        </h2>
        {!isEditing && (
          <div className="flex rounded-lg border border-gray-200 overflow-hidden text-sm">
            <button
              type="button"
              onClick={() => setMode('quick')}
              className={`px-3 py-1.5 font-medium transition ${
                mode === 'quick' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              Quick
            </button>
            <button
              type="button"
              onClick={() => setMode('full')}
              className={`px-3 py-1.5 font-medium transition ${
                mode === 'full' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              Full Form
            </button>
          </div>
        )}
      </div>

      {/* Quick entry */}
      {mode === 'quick' && !isEditing && (
        <form onSubmit={handleQuickSubmit} className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Pick an exercise (optional)</label>
            <select
              onChange={e => {
                const ex = PREDEFINED_EXERCISES.find(x => x.name === e.target.value);
                if (ex) setQuickText(`${ex.type}, ${ex.name}, `);
                e.target.value = '';
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              defaultValue=""
            >
              <option value="" disabled>Select exercise to pre-fill...</option>
              {['Lower Body', 'Upper Body', 'Abs', 'Peak 8'].map(type => (
                <optgroup key={type} label={type}>
                  {PREDEFINED_EXERCISES.filter(ex => ex.type === type).map(ex => (
                    <option key={ex.name} value={ex.name}>{ex.name}</option>
                  ))}
                </optgroup>
              ))}
            </select>
          </div>
          <p className="text-xs text-gray-500">
            Format: <span className="font-mono">Type, Name, SetsxReps, Weight, Focus, Max flag</span>
          </p>
          <textarea
            value={quickText}
            onChange={e => { setQuickText(e.target.value); setQuickError(''); }}
            placeholder="Lower Body, Squats, 3x10, 135lbs, Push, max weight"
            rows={3}
            className={`w-full px-3 py-2 border rounded-lg font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition resize-none ${
              quickError ? 'border-red-400' : 'border-gray-300'
            }`}
          />
          {quickError && <p className="text-red-500 text-xs">{quickError}</p>}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Date (defaults to today)</label>
            <input
              type="date"
              value={quickDate}
              onChange={e => setQuickDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            />
          </div>
          <button
            type="submit"
            disabled={!quickText.trim()}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-medium py-2 px-4 rounded-lg transition focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Log Exercise
          </button>
        </form>
      )}

      {/* Full form */}
      {(mode === 'full' || isEditing) && (
        <form onSubmit={handleFullSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Pick an exercise (optional)</label>
            <select
              onChange={e => {
                const ex = PREDEFINED_EXERCISES.find(x => x.name === e.target.value);
                if (ex) setFormData(prev => ({ ...prev, name: ex.name, type: ex.type }));
                e.target.value = '';
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              defaultValue=""
            >
              <option value="" disabled>Select exercise to pre-fill...</option>
              {['Lower Body', 'Upper Body', 'Abs', 'Peak 8'].map(type => (
                <optgroup key={type} label={type}>
                  {PREDEFINED_EXERCISES.filter(ex => ex.type === type).map(ex => (
                    <option key={ex.name} value={ex.name}>{ex.name}</option>
                  ))}
                </optgroup>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Exercise Name <span className="text-red-500">*</span>
            </label>
            <input
              id="name" type="text" name="name" value={formData.name}
              onChange={handleChange} placeholder="e.g., Bench Press"
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition ${errors.name ? 'border-red-500' : 'border-gray-300'}`}
            />
            {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
          </div>

          <div>
            <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
              Type <span className="text-red-500">*</span>
            </label>
            <select
              id="type" name="type" value={formData.type} onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition ${errors.type ? 'border-red-500' : 'border-gray-300'}`}
            >
              <option value="">Select a type</option>
              {EXERCISE_TYPES.map(type => <option key={type} value={type}>{type}</option>)}
            </select>
            {errors.type && <p className="text-red-500 text-sm mt-1">{errors.type}</p>}
          </div>

          <div>
            <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
              Date <span className="text-red-500">*</span>
            </label>
            <input
              id="date" type="date" name="date" value={formData.date} onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition ${errors.date ? 'border-red-500' : 'border-gray-300'}`}
            />
            {errors.date && <p className="text-red-500 text-sm mt-1">{errors.date}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="sets" className="block text-sm font-medium text-gray-700 mb-1">
                Sets <span className="text-red-500">*</span>
              </label>
              <input
                id="sets" type="number" name="sets" value={formData.sets}
                onChange={handleChange} min="1"
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition ${errors.sets ? 'border-red-500' : 'border-gray-300'}`}
              />
              {errors.sets && <p className="text-red-500 text-sm mt-1">{errors.sets}</p>}
            </div>
            <div>
              <label htmlFor="reps" className="block text-sm font-medium text-gray-700 mb-1">
                Reps <span className="text-red-500">*</span>
              </label>
              <input
                id="reps" type="number" name="reps" value={formData.reps}
                onChange={handleChange} min="1"
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition ${errors.reps ? 'border-red-500' : 'border-gray-300'}`}
              />
              {errors.reps && <p className="text-red-500 text-sm mt-1">{errors.reps}</p>}
            </div>
          </div>

          <div>
            <label htmlFor="weight" className="block text-sm font-medium text-gray-700 mb-1">
              Weight (optional)
            </label>
            <div className="flex gap-2">
              <input
                id="weight" type="number" name="weight" value={formData.weight}
                onChange={handleChange} placeholder="0" step="0.5"
                className={`flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition ${errors.weight ? 'border-red-500' : 'border-gray-300'}`}
              />
              <select name="unit" value={formData.unit} onChange={handleChange}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition">
                <option value="lbs">lbs</option>
                <option value="kg">kg</option>
              </select>
            </div>
            {errors.weight && <p className="text-red-500 text-sm mt-1">{errors.weight}</p>}
          </div>

          <div className="space-y-3 pt-2">
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" name="isMaxWeight" checked={formData.isMaxWeight}
                onChange={handleChange}
                className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500 cursor-pointer"
              />
              <span className="text-sm text-gray-700">Max Weight</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" name="isMaxReps" checked={formData.isMaxReps}
                onChange={handleChange}
                className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500 cursor-pointer"
              />
              <span className="text-sm text-gray-700">Max Reps</span>
            </label>
          </div>

          <div>
            <label htmlFor="focus" className="block text-sm font-medium text-gray-700 mb-1">
              Focus (optional)
            </label>
            <input
              id="focus" type="text" name="focus" value={formData.focus}
              onChange={handleChange} placeholder="e.g. Push, Pull, Compound"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            />
          </div>

          <div>
            <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
              Notes (optional)
            </label>
            <textarea
              id="notes" name="notes" value={formData.notes}
              onChange={handleChange} placeholder="Add any notes about this exercise..."
              rows="3"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition resize-none"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button type="submit"
              className="flex-1 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-medium py-2 px-4 rounded-lg transition focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              {isEditing ? 'Update Exercise' : 'Log Exercise'}
            </button>
            {isEditing && (
              <button type="button" onClick={handleCancel}
                className="flex-1 bg-gray-200 hover:bg-gray-300 active:bg-gray-400 text-gray-900 font-medium py-2 px-4 rounded-lg transition focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
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
