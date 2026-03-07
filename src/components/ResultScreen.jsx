import { calcPercent, gradeFromPercent, MODE_LABELS } from '../utils/quizUtils';

export default function ResultScreen({ score, totalDrugs, category, mode, onPlayAgain, onHome }) {
  const { correct, attempts } = score;
  const accuracy = calcPercent(correct, attempts);
  const grade = gradeFromPercent(accuracy);
  const modeLabel = MODE_LABELS[mode] || mode;

  const gradeColors = {
    A: '#16a34a',
    B: '#2563eb',
    C: '#d97706',
    D: '#ea580c',
    F: '#dc2626',
  };
  const gradeColor = gradeColors[grade] || '#64748b';

  function getMessage() {
    if (accuracy >= 90) return 'Outstanding! 🏆 You clearly know your pharmacology.';
    if (accuracy >= 80) return 'Great work! 👏 Keep reviewing and you\'ll nail it.';
    if (accuracy >= 70) return 'Good effort! 📚 A couple more rounds and you\'ll master this.';
    if (accuracy >= 60) return 'Not bad! 💪 Focus on the ones you missed and try again.';
    return 'Keep practicing! 🔄 Repetition is key to pharmacology mastery.';
  }

  return (
    <div className="result-screen">
      <div className="result-card">
        <h1 className="result-title">Quiz Complete!</h1>
        <p className="result-subtitle">
          {category.label} · {modeLabel}
        </p>

        {/* Grade circle */}
        <div className="grade-circle" style={{ borderColor: gradeColor, color: gradeColor }}>
          {grade}
        </div>

        {/* Stats */}
        <div className="result-stats">
          <div className="stat-box">
            <span className="stat-value">{accuracy}%</span>
            <span className="stat-label">Accuracy</span>
          </div>
          <div className="stat-box">
            <span className="stat-value">{correct}</span>
            <span className="stat-label">Correct</span>
          </div>
          <div className="stat-box">
            <span className="stat-value">{attempts - correct}</span>
            <span className="stat-label">Incorrect</span>
          </div>
          <div className="stat-box">
            <span className="stat-value">{totalDrugs}</span>
            <span className="stat-label">Total Drugs</span>
          </div>
        </div>

        <p className="result-message">{getMessage()}</p>

        {/* Action buttons */}
        <div className="result-actions">
          <button
            className="result-btn primary-btn"
            style={{ backgroundColor: category.color }}
            onClick={onPlayAgain}
          >
            Play Again 🔄
          </button>
          <button className="result-btn secondary-btn" onClick={onHome}>
            Home 🏠
          </button>
        </div>
      </div>
    </div>
  );
}
