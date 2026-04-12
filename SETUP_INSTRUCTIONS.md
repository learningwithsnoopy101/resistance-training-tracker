# Resistance Training Tracker - Setup Instructions

## Quick Start

This document provides step-by-step instructions to set up the Resistance Training Tracker app locally and deploy it to GitHub Pages.

---

## Step 1: Navigate to Project Directory

```bash
cd ~/resistance-training-tracker
```

---

## Step 2: Run the Setup Script

Copy and paste the entire script below into your terminal:

```bash
# Create folders
mkdir -p components styles

# Create App.jsx
cat > App.jsx << 'EOF'
import React, { useState, useEffect } from 'react';
import '@/styles/globals.css';
import ExerciseForm from '@/components/ExerciseForm';
import ExerciseList from '@/components/ExerciseList';

const STORAGE_KEY = 'resistanceTrainingExercises';

export default function App() {
  const [exercises, setExercises] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editingData, setEditingData] = useState(null);

  useEffect(() => {
    try {
      const savedExercises = localStorage.getItem(STORAGE_KEY);
      if (savedExercises) {
        setExercises(JSON.parse(savedExercises));
      }
    } catch (error) {
      console.error('Failed to load exercises from localStorage:', error);
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(exercises));
    } catch (error) {
      console.error('Failed to save exercises to localStorage:', error);
    }
  }, [exercises]);

  const handleAddExercise = (formData) => {
    if (editingId) {
      setExercises(exercises.map(ex => 
        ex.id === editingId ? { ...formData, id: editingId } : ex
      ));
      setEditingId(null);
      setEditingData(null);
    } else {
      const newExercise = {
        ...formData,
        id: Date.now(),
      };
      setExercises([newExercise, ...exercises]);
    }
  };

  const handleEditExercise = (exercise) => {
    setEditingId(exercise.id);
    setEditingData(exercise);
  };

  const handleDeleteExercise = (id) => {
    setExercises(exercises.filter(ex => ex.id !== id));
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditingData(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex flex-col lg:flex-row gap-6 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
        <div className="w-full lg:w-96 lg:sticky lg:top-8 lg:h-fit">
          <ExerciseForm 
            onSubmit={handleAddExercise}
            editingData={editingData}
            onCancelEdit={handleCancelEdit}
          />
        </div>

        <div className="flex-1 min-w-0">
          <ExerciseList 
            exercises={exercises}
            onEdit={handleEditExercise}
            onDelete={handleDeleteExercise}
            editingId={editingId}
          />
        </div>
      </div>
    </div>
  );
}
EOF

# Create main.jsx
cat > main.jsx << 'EOF'
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from '@/App.jsx'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
EOF

# Create index.html
cat > index.html << 'EOF'
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Resistance Training Tracker</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/main.jsx"></script>
  </body>
</html>
EOF

# Create package.json
cat > package.json << 'EOF'
{
  "name": "resistance-training-tracker",
  "private": true,
  "version": "0.0.1",
  "type": "module",
  "homepage": "https://learningwithsnoopy101.github.io/resistance-training-tracker",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "deploy": "npm run build && gh-pages -d dist"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.2.1",
    "autoprefixer": "^10.4.16",
    "gh-pages": "^6.1.1",
    "postcss": "^8.4.31",
    "tailwindcss": "^3.3.6",
    "vite": "^5.0.8"
  }
}
EOF

# Create vite.config.js
cat > vite.config.js << 'EOF'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './'),
    },
  },
  base: '/resistance-training-tracker/',
})
EOF

# Create tailwind.config.js
cat > tailwind.config.js << 'EOF'
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./App.jsx",
    "./components/**/*.{js,jsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
EOF

# Create postcss.config.js
cat > postcss.config.js << 'EOF'
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
EOF

# Create .gitignore
cat > .gitignore << 'EOF'
node_modules
dist
dist-ssr
*.local
.DS_Store
EOF

# Create ExerciseForm.jsx
cat > components/ExerciseForm.jsx << 'EOF'
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
EOF

# Create ExerciseList.jsx
cat > components/ExerciseList.jsx << 'EOF'
import React from 'react';
import ExerciseCard from '@/components/ExerciseCard';

export default function ExerciseList({ exercises, onEdit, onDelete, editingId }) {
  if (exercises.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4">
        <div className="text-center">
          <h3 className="text-lg font-medium text-gray-900 mb-2">No exercises logged yet</h3>
          <p className="text-gray-600">Start by adding your first exercise using the form on the left.</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Exercise Log</h2>
      <div className="space-y-4">
        {exercises.map(exercise => (
          <ExerciseCard
            key={exercise.id}
            exercise={exercise}
            onEdit={onEdit}
            onDelete={onDelete}
            isEditing={editingId === exercise.id}
          />
        ))}
      </div>
    </div>
  );
}
EOF

# Create ExerciseCard.jsx
cat > components/ExerciseCard.jsx << 'EOF'
import React from 'react';

const TYPE_COLORS = {
  'Upper Body': 'bg-blue-100 text-blue-800',
  'Lower Body': 'bg-green-100 text-green-800',
  'Abs': 'bg-purple-100 text-purple-800',
  'Peak 8': 'bg-orange-100 text-orange-800',
};

export default function ExerciseCard({ exercise, onEdit, onDelete, isEditing }) {
  const formatDate = (dateString) => {
    const date = new Date(dateString + 'T00:00:00');
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const typeColor = TYPE_COLORS[exercise.type] || 'bg-gray-100 text-gray-800';

  return (
    <div
      className={`bg-white rounded-lg shadow-md p-6 transition-all ${
        isEditing ? 'ring-2 ring-blue-500 shadow-lg' : 'hover:shadow-lg'
      }`}
    >
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-bold text-gray-900 break-words">{exercise.name}</h3>
          <div className="flex flex-wrap gap-2 mt-3">
            <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${typeColor}`}>
              {exercise.type}
            </span>
            <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
              {formatDate(exercise.date)}
            </span>
          </div>
        </div>

        <div className="flex gap-2 flex-shrink-0">
          <button
            onClick={() => onEdit(exercise)}
            className="px-4 py-2 bg-blue-50 hover:bg-blue-100 active:bg-blue-200 text-blue-700 font-medium rounded-lg transition focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Edit
          </button>
          <button
            onClick={() => {
              if (window.confirm(`Delete ${exercise.name}?`)) {
                onDelete(exercise.id);
              }
            }}
            className="px-4 py-2 bg-red-50 hover:bg-red-100 active:bg-red-200 text-red-700 font-medium rounded-lg transition focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
          >
            Delete
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4 pb-4 border-b border-gray-200">
        <div>
          <p className="text-xs font-medium text-gray-600 uppercase tracking-wide">Sets</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{exercise.sets}</p>
        </div>
        <div>
          <p className="text-xs font-medium text-gray-600 uppercase tracking-wide">Reps</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{exercise.reps}</p>
        </div>
        {exercise.weight && (
          <div>
            <p className="text-xs font-medium text-gray-600 uppercase tracking-wide">Weight</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">
              {exercise.weight} <span className="text-sm text-gray-600">{exercise.unit}</span>
            </p>
          </div>
        )}
        {(exercise.isMaxWeight || exercise.isMaxReps) && (
          <div>
            <p className="text-xs font-medium text-gray-600 uppercase tracking-wide">Achievements</p>
            <div className="flex flex-wrap gap-1 mt-1">
              {exercise.isMaxWeight && (
                <span className="inline-block px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-semibold rounded">
                  Max W
                </span>
              )}
              {exercise.isMaxReps && (
                <span className="inline-block px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-semibold rounded">
                  Max R
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {exercise.notes && (
        <div>
          <p className="text-xs font-medium text-gray-600 uppercase tracking-wide mb-2">Notes</p>
          <p className="text-gray-700 text-sm leading-relaxed">{exercise.notes}</p>
        </div>
      )}
    </div>
  );
}
EOF

# Create globals.css
cat > styles/globals.css << 'EOF'
@tailwind base;
@tailwind components;
@tailwind utilities;

* {
  box-sizing: border-box;
}

html {
  scroll-behavior: smooth;
}

body {
  margin: 0;
  padding: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
    'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
    sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

:focus-visible {
  outline: 2px solid #3b82f6;
  outline-offset: 2px;
}

button,
input,
select,
textarea {
  transition: all 0.2s ease-in-out;
}

input[type='number']::-webkit-outer-spin-button,
input[type='number']::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

input[type='number'] {
  -moz-appearance: textfield;
}
EOF

echo "✅ All files created successfully!"
```

---

## Step 3: Install Dependencies

```bash
npm install
```

---

## Step 4: Run Development Server

```bash
npm run dev
```

Then open your browser and go to: **http://localhost:5173**

---

## Step 5: Build for Production

```bash
npm run build
```

This creates a `dist` folder with optimized production files.

---

## Step 6: Deploy to GitHub Pages

### Option A: Using npm script
```bash
npm run deploy
```

### Option B: Manual deployment
```bash
npm run build
npx gh-pages -d dist
```

Your app will be live at: **https://learningwithsnoopy101.github.io/resistance-training-tracker**

---

## Step 7: Push Code to GitHub

```bash
git add .
git commit -m "Initial setup: Add React resistance tracker app"
git push
```

---

## Features

✅ Log exercises with name, type, date, sets, reps, and weight
✅ Exercise types: Upper Body, Lower Body, Abs, Peak 8
✅ Track max weight and max reps achievements
✅ Add notes to exercises
✅ Edit and delete exercises
✅ Form validation with error messages
✅ Persistent storage (localStorage) - data saved on your device
✅ Responsive design (works on desktop, tablet, and mobile)
✅ Accessible with keyboard navigation

---

## Tech Stack

- **React 18** — UI library
- **Vite** — Build tool & dev server
- **Tailwind CSS** — Styling
- **localStorage** — Data persistence
- **gh-pages** — GitHub Pages deployment

---

## Troubleshooting

### Port already in use
If port 5173 is in use, Vite will use the next available port.

### Dependencies failing to install
Try clearing cache and reinstalling:
```bash
rm -rf node_modules package-lock.json
npm install
```

### Deployment issues
Make sure you have:
- `gh-pages` package installed
- GitHub Pages enabled in repository settings
- Correct homepage URL in package.json

---

## Next Steps

1. Run the setup script in terminal
2. Test locally with `npm run dev`
3. Deploy with `npm run deploy`
4. Share your deployed app link!

---

## Support

For issues or questions, check:
- [Vite Documentation](https://vitejs.dev)
- [React Documentation](https://react.dev)
- [Tailwind CSS Documentation](https://tailwindcss.com)
