import React, { useRef, useState } from 'react';

export default function DataPortability({ exercises, onImport }) {
  const fileInputRef = useRef(null);
  const [message, setMessage] = useState('');

  const handleExport = () => {
    const json = JSON.stringify(exercises, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `exercises-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target.result);
        if (!Array.isArray(data)) throw new Error('Invalid format');
        onImport(data);
        setMessage(`${data.length} exercises imported.`);
        setTimeout(() => setMessage(''), 3000);
      } catch {
        setMessage('Import failed — file format not recognised.');
        setTimeout(() => setMessage(''), 3000);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="bg-cream rounded-card shadow-card border-[0.5px] border-taupe p-4">
      <h3 className="text-h3-warm text-ink mb-3">Data</h3>
      <div className="flex gap-2">
        <button
          onClick={handleExport}
          disabled={exercises.length === 0}
          className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-xs-warm font-medium text-ink bg-beige hover:bg-taupe disabled:opacity-50 rounded-input transition focus:outline-none focus:ring-2 focus:ring-lower-body"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
            <polyline points="7 10 12 15 17 10"/>
            <line x1="12" y1="15" x2="12" y2="3"/>
          </svg>
          Export
        </button>
        <button
          onClick={() => fileInputRef.current.click()}
          className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-xs-warm font-medium text-ink bg-beige hover:bg-taupe rounded-input transition focus:outline-none focus:ring-2 focus:ring-lower-body"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
            <polyline points="17 8 12 3 7 8"/>
            <line x1="12" y1="3" x2="12" y2="15"/>
          </svg>
          Import
        </button>
        <input ref={fileInputRef} type="file" accept=".json" onChange={handleImport} className="hidden" />
      </div>
      {message && <p className="mt-2 text-tiny text-center text-lower-body-ink font-medium">{message}</p>}
    </div>
  );
}
