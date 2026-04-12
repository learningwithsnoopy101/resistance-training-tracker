import React, { useState, useEffect } from 'react';

const EXERCISE_TYPES = ['Upper Body', 'Lower Body', 'Abs', 'Peak 8'];

export default function ExerciseForm({ onSubmit, editingData, onCancelEdit }) {
  const [formData, setFormData] = useState({
    name: '',
    type: '',
    date: new Date().toISOString().split('T')[0],
    sets: 3,
    reps: 10,
    weight: '',
    unit: 'lbs',
    isMaxWeight: false,
    isMaxReps: false,
    notes: '',
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (editingData) {
      setFormData(editingData);
      setErrors({});
    }
  }, [editingData]);

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

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
      setFormData({
        name: '',
        type: '',
        date: new Date().toISOString().split('T')[0],
        sets: 3,
        reps: 10,
        weight: '',
        unit: 'lbs',
        isMaxWeight: false,
        isMaxReps: false,
        notes: '',
      });
      setErrors({});
    }
  };

  const handleCancel = () => {
    setFormData({
      name: '',
      type: '',
      date: new Date().toISOString().split('T')[0],
      sets: 3,
      reps: 10,
      weight: '',
      unit: 'lbs',
      isMaxWeight: false,
      isMaxReps: false,
      notes: '',
    });
    setErrors({});
    onCancelEdit();
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6 space-y-5">
      <h2 className="text-xl font-bold text-gray-900 mb-6">
        {editingData ? 'Edit Exercise' : 'Log Exercise'}
      </h2>

      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
          Exercise Name <span className="text-red-500">*</span>
        </label>
        <input
          id="name"
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="e.g., Bench Press"
          className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition ${
            errors.name ? 'border-red-500' : 'border-gray-300'
          }`}
        />
        {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
      </div>

      <div>
        <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
          Type <span className="text-red-500">*</span>
        </label>
        <select
          id="type"
          name="type"
          value={formData.type}
          onChange={handleChange}
          className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition ${
            errors.type ? 'border-red-500' : 'border-gray-300'
          }`}
        >
          <option value="">Select a type</option>
          {EXERCISE_TYPES.map(type => (
            <option key={type} value={type}>{type}</option>
          ))}
        </select>
        {errors.type && <p className="text-red-500 text-sm mt-1">{errors.type}</p>}
      </div>

      <div>
        <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
          Date <span className="text-red-500">*</span>
        </label>
        <input
          id="date"
          type="date"
          name="date"
          value={formData.date}
          onChange={handleChange}
          className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition ${
            errors.date ? 'border-red-500' : 'border-gray-300'
          }`}
        />
        {errors.date && <p className="text-red-500 text-sm mt-1">{errors.date}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="sets" className="block text-sm font-medium text-gray-700 mb-1">
            Sets <span className="text-red-500">*</span>
          </label>
          <input
            id="sets"
            type="number"
            name="sets"
            value={formData.sets}
            onChange={handleChange}
            min="1"
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition ${
              errors.sets ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.sets && <p className="text-red-500 text-sm mt-1">{errors.sets}</p>}
        </div>

        <div>
          <label htmlFor="reps" className="block text-sm font-medium text-gray-700 mb-1">
            Reps <span className="text-red-500">*</span>
          </label>
          <input
            id="reps"
            type="number"
            name="reps"
            value={formData.reps}
            onChange={handleChange}
            min="1"
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition ${
              errors.reps ? 'border-red-500' : 'border-gray-300'
            }`}
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
            id="weight"
            type="number"
            name="weight"
            value={formData.weight}
            onChange={handleChange}
            placeholder="0"
            step="0.5"
            className={`flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition ${
              errors.weight ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          <select
            name="unit"
            value={formData.unit}
            onChange={handleChange}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
          >
            <option value="lbs">lbs</option>
            <option value="kg">kg</option>
          </select>
        </div>
        {errors.weight && <p className="text-red-500 text-sm mt-1">{errors.weight}</p>}
      </div>

      <div className="space-y-3 pt-2">
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            name="isMaxWeight"
            checked={formData.isMaxWeight}
            onChange={handleChange}
            className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500 cursor-pointer"
          />
          <span className="text-sm text-gray-700">Max Weight</span>
        </label>

        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            name="isMaxReps"
            checked={formData.isMaxReps}
            onChange={handleChange}
            className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500 cursor-pointer"
          />
          <span className="text-sm text-gray-700">Max Reps</span>
        </label>
      </div>

      <div>
        <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
          Notes (optional)
        </label>
        <textarea
          id="notes"
          name="notes"
          value={formData.notes}
          onChange={handleChange}
          placeholder="Add any notes about this exercise..."
          rows="3"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition resize-none"
        />
      </div>

      <div className="flex gap-3 pt-4">
        <button
          type="submit"
          className="flex-1 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-medium py-2 px-4 rounded-lg transition focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          {editingData ? 'Update Exercise' : 'Log Exercise'}
        </button>
        {editingData && (
          <button
            type="button"
            onClick={handleCancel}
            className="flex-1 bg-gray-200 hover:bg-gray-300 active:bg-gray-400 text-gray-900 font-medium py-2 px-4 rounded-lg transition focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
