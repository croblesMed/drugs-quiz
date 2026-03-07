import { useState, useRef } from 'react';
import { psychDrugs } from '../data/psychDrugs';
import { hemeOncDrugs } from '../data/hemeOncDrugs';
import { parseCSV, generateCSVTemplate } from '../utils/csvParser';
import { MODE_LABELS } from '../utils/quizUtils';

const BUILT_IN_CATEGORIES = [
  {
    id: 'psych',
    label: 'Psychiatry Drugs',
    emoji: '🧠',
    description:
      'SSRIs, MAOIs, TCAs, SNRIs, Antipsychotics, Mood Stabilizers, Benzodiazepines, Hypnotics, ADHD & Alzheimer drugs, and MAT agents',
    drugs: psychDrugs,
    color: '#7c3aed',
    lightColor: '#ede9fe',
  },
  {
    id: 'heme-onc',
    label: 'Heme / Onc Drugs',
    emoji: '🩸',
    description:
      'Chemotherapy, Targeted Therapy, Monoclonal Antibodies, Hormonal Agents, Anticoagulants, Antiplatelets, Thrombolytics, and Hematopoietic Growth Factors',
    drugs: hemeOncDrugs,
    color: '#dc2626',
    lightColor: '#fee2e2',
  },
];

const QUIZ_MODES = Object.entries(MODE_LABELS).map(([id, label]) => ({ id, label }));

export default function HomeScreen({ onStartQuiz }) {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedMode, setSelectedMode] = useState('class');
  const [csvCategory, setCsvCategory] = useState(null);
  const [csvError, setCsvError] = useState('');
  const [showDrugList, setShowDrugList] = useState(false);
  const fileRef = useRef();

  const allCategories = csvCategory
    ? [...BUILT_IN_CATEGORIES, csvCategory]
    : BUILT_IN_CATEGORIES;

  function handleFileChange(e) {
    const file = e.target.files[0];
    if (!file) return;
    setCsvError('');
    const reader = new FileReader();
    reader.onload = (evt) => {
      const { drugs, errors } = parseCSV(evt.target.result);
      if (errors.length > 0) {
        setCsvError(errors.join('\n'));
        return;
      }
      const cat = {
        id: 'csv',
        label: file.name.replace(/\.csv$/i, ''),
        emoji: '📋',
        description: `Custom category – ${drugs.length} drugs loaded from CSV`,
        drugs,
        color: '#0284c7',
        lightColor: '#e0f2fe',
      };
      setCsvCategory(cat);
      setSelectedCategory(cat);
    };
    reader.readAsText(file);
  }

  function downloadTemplate() {
    const blob = new Blob([generateCSVTemplate()], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'drug-quiz-template.csv';
    a.click();
    URL.revokeObjectURL(url);
  }

  const activeCat = selectedCategory;

  return (
    <div className="home-screen">
      <header className="app-header">
        <h1 className="app-title">💊 Drug Quiz</h1>
        <p className="app-subtitle">
          Master medical pharmacology with interactive matching rounds
        </p>
      </header>

      {/* Category Selection */}
      <section className="section">
        <h2 className="section-title">Select Category</h2>
        <div className="category-grid">
          {allCategories.map((cat) => (
            <button
              key={cat.id}
              className={`category-card ${selectedCategory?.id === cat.id ? 'selected' : ''}`}
              style={
                selectedCategory?.id === cat.id
                  ? { borderColor: cat.color, backgroundColor: cat.lightColor }
                  : {}
              }
              onClick={() => setSelectedCategory(cat)}
            >
              <span className="cat-emoji">{cat.emoji}</span>
              <h3 className="cat-name">{cat.label}</h3>
              <p className="cat-desc">{cat.description}</p>
              <span
                className="cat-count"
                style={{ backgroundColor: cat.color }}
              >
                {cat.drugs.length} drugs
              </span>
            </button>
          ))}
        </div>
      </section>

      {/* CSV Upload */}
      <section className="section csv-section">
        <h2 className="section-title">Custom CSV</h2>
        <p className="csv-desc">
          Load your own drug list from a CSV file.{' '}
          <button className="link-btn" onClick={downloadTemplate}>
            Download template
          </button>
        </p>
        <div className="csv-controls">
          <label className="upload-btn">
            📂 Upload CSV
            <input
              ref={fileRef}
              type="file"
              accept=".csv,text/csv"
              style={{ display: 'none' }}
              onChange={handleFileChange}
            />
          </label>
          {csvCategory && (
            <span className="csv-loaded">
              ✅ {csvCategory.label} ({csvCategory.drugs.length} drugs loaded)
            </span>
          )}
        </div>
        {csvError && <pre className="csv-error">{csvError}</pre>}
      </section>

      {/* Mode Selection (only after category selected) */}
      {activeCat && (
        <section className="section">
          <h2 className="section-title">Select Quiz Mode</h2>
          <div className="mode-grid">
            {QUIZ_MODES.map((mode) => (
              <button
                key={mode.id}
                className={`mode-card ${selectedMode === mode.id ? 'selected' : ''}`}
                onClick={() => setSelectedMode(mode.id)}
              >
                {mode.label}
              </button>
            ))}
          </div>

          <div className="start-area">
            <button
              className="start-btn"
              style={{ backgroundColor: activeCat.color }}
              onClick={() => onStartQuiz(activeCat, selectedMode)}
            >
              Start Quiz →
            </button>
            <button
              className="list-btn"
              onClick={() => setShowDrugList((v) => !v)}
            >
              {showDrugList ? 'Hide Drug List' : 'View Drug List'}
            </button>
          </div>

          {showDrugList && (
            <div className="drug-list-panel">
              <h3>
                {activeCat.label} — All {activeCat.drugs.length} Drugs
              </h3>
              <div className="drug-list-grid">
                {activeCat.drugs.map((d) => (
                  <div key={d.id} className="drug-list-card">
                    <div className="dl-name">
                      {d.name}
                      {d.brandName && (
                        <span className="dl-brand"> ({d.brandName})</span>
                      )}
                    </div>
                    <div className="dl-class">{d.class}</div>
                    {d.uses && <div className="dl-detail">📌 {d.uses}</div>}
                    {d.sideEffects && (
                      <div className="dl-detail">⚠️ {d.sideEffects}</div>
                    )}
                    {d.contraindications && (
                      <div className="dl-detail">🚫 {d.contraindications}</div>
                    )}
                    {d.mechanism && (
                      <div className="dl-detail">⚙️ {d.mechanism}</div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>
      )}
    </div>
  );
}
