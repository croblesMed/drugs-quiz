import { useState, useEffect, useCallback } from 'react';
import { buildRounds, getPropertyValue, MODE_LABELS, MODE_INSTRUCTIONS } from '../utils/quizUtils';
import { shuffle } from '../utils/quizUtils';

const ROUND_SIZE = 5;

export default function QuizScreen({ category, mode, onComplete, onExit }) {
  const { label: catLabel, drugs, color } = category;

  const [rounds, setRounds] = useState([]);
  const [roundIdx, setRoundIdx] = useState(0);

  // Per-round state
  const [leftItems, setLeftItems] = useState([]);   // drug objects in display order
  const [rightItems, setRightItems] = useState([]); // { drug, value } in display order
  const [selectedLeft, setSelectedLeft] = useState(null);   // index into leftItems
  const [selectedRight, setSelectedRight] = useState(null); // index into rightItems
  const [matchedIds, setMatchedIds] = useState(new Set());  // matched drug ids
  const [wrongIds, setWrongIds] = useState(new Set());      // ids flashing wrong

  const [score, setScore] = useState({ correct: 0, attempts: 0 });
  const [totalDrugs, setTotalDrugs] = useState(0);
  const [matchedDrugs, setMatchedDrugs] = useState(0);

  // Build rounds on mount
  useEffect(() => {
    const r = buildRounds(drugs, mode, ROUND_SIZE);
    setRounds(r);
    setTotalDrugs(drugs.length);
  }, [drugs, mode]);

  // Load a round when roundIdx or rounds change
  useEffect(() => {
    if (rounds.length === 0) return;
    if (roundIdx >= rounds.length) {
      // Quiz finished
      onComplete(score, totalDrugs);
      return;
    }
    loadRound(rounds[roundIdx]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rounds, roundIdx]);

  const loadRound = useCallback(
    (roundDrugs) => {
      const left = shuffle([...roundDrugs]);
      const right = shuffle(
        roundDrugs.map((d) => ({ drug: d, value: getPropertyValue(d, mode) }))
      );
      setLeftItems(left);
      setRightItems(right);
      setSelectedLeft(null);
      setSelectedRight(null);
      setMatchedIds(new Set());
      setWrongIds(new Set());
    },
    [mode]
  );

  // ── Attempt a match when both sides are selected ──────────────────────────
  useEffect(() => {
    if (selectedLeft === null || selectedRight === null) return;

    const drugLeft = leftItems[selectedLeft];
    const { drug: drugRight } = rightItems[selectedRight];

    setScore((s) => ({ ...s, attempts: s.attempts + 1 }));

    if (drugLeft.id === drugRight.id) {
      // Correct match
      setMatchedIds((prev) => new Set([...prev, drugLeft.id]));
      setMatchedDrugs((n) => n + 1);
      setScore((s) => ({ ...s, correct: s.correct + 1 }));
      setSelectedLeft(null);
      setSelectedRight(null);
    } else {
      // Wrong match – flash red briefly
      const wrongSet = new Set([drugLeft.id, drugRight.id]);
      setWrongIds(wrongSet);
      setSelectedLeft(null);
      setSelectedRight(null);
      setTimeout(() => setWrongIds(new Set()), 600);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedLeft, selectedRight]);

  // ── Auto-advance to next round when all matched ───────────────────────────
  useEffect(() => {
    if (rounds.length === 0 || roundIdx >= rounds.length) return;
    const currentRound = rounds[roundIdx];
    if (matchedIds.size === currentRound.length && currentRound.length > 0) {
      // Small delay so user sees the last match
      const timer = setTimeout(() => {
        setRoundIdx((r) => r + 1);
      }, 700);
      return () => clearTimeout(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [matchedIds]);

  // ── Click handlers ─────────────────────────────────────────────────────────
  function handleLeftClick(idx) {
    const drug = leftItems[idx];
    if (matchedIds.has(drug.id)) return; // already matched
    if (selectedLeft === idx) {
      setSelectedLeft(null); // deselect
    } else {
      setSelectedLeft(idx);
    }
  }

  function handleRightClick(idx) {
    const { drug } = rightItems[idx];
    if (matchedIds.has(drug.id)) return; // already matched
    if (selectedRight === idx) {
      setSelectedRight(null); // deselect
    } else {
      setSelectedRight(idx);
    }
  }

  // ── Progress calculations ─────────────────────────────────────────────────
  const progressPct = totalDrugs > 0 ? Math.round((matchedDrugs / totalDrugs) * 100) : 0;
  const accuracy =
    score.attempts > 0 ? Math.round((score.correct / score.attempts) * 100) : 100;

  const modeLabel = MODE_LABELS[mode] || mode;
  const instruction = MODE_INSTRUCTIONS[mode] || '';

  // ── Render ────────────────────────────────────────────────────────────────
  if (rounds.length === 0) {
    return <div className="quiz-loading">Loading quiz…</div>;
  }

  return (
    <div className="quiz-screen">
      {/* Header */}
      <div className="quiz-header">
        <button className="exit-btn" onClick={onExit}>
          ← Exit
        </button>
        <div className="quiz-meta">
          <span className="quiz-cat" style={{ color }}>
            {catLabel}
          </span>
          <span className="quiz-mode">· {modeLabel}</span>
        </div>
        <div className="quiz-stats">
          <span title="Accuracy">🎯 {accuracy}%</span>
          <span title="Drugs matched">
            📋 {matchedDrugs}/{totalDrugs}
          </span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="progress-bar-track">
        <div
          className="progress-bar-fill"
          style={{ width: `${progressPct}%`, backgroundColor: color }}
        />
      </div>

      {/* Instruction */}
      <p className="quiz-instruction">{instruction}</p>

      {/* Round indicator */}
      <p className="round-indicator">
        Round {Math.min(roundIdx + 1, rounds.length)} of {rounds.length}
      </p>

      {/* Matching board */}
      <div className="quiz-board">
        {/* Left column – drug names */}
        <div className="quiz-col quiz-col-left">
          <div className="col-label">Drug Name</div>
          {leftItems.map((drug, idx) => {
            const isMatched = matchedIds.has(drug.id);
            const isSelected = selectedLeft === idx;
            const isWrong = wrongIds.has(drug.id);
            return (
              <button
                key={drug.id}
                className={[
                  'tile',
                  isMatched ? 'tile-matched' : '',
                  isSelected ? 'tile-selected' : '',
                  isWrong ? 'tile-wrong' : '',
                ].join(' ')}
                onClick={() => handleLeftClick(idx)}
                disabled={isMatched}
                style={isSelected ? { borderColor: color, backgroundColor: `${color}18` } : {}}
              >
                <span className="tile-name">{drug.name}</span>
                {drug.brandName && (
                  <span className="tile-brand">{drug.brandName}</span>
                )}
              </button>
            );
          })}
        </div>

        {/* Right column – properties */}
        <div className="quiz-col quiz-col-right">
          <div className="col-label">{modeLabel}</div>
          {rightItems.map(({ drug, value }, idx) => {
            const isMatched = matchedIds.has(drug.id);
            const isSelected = selectedRight === idx;
            const isWrong = wrongIds.has(drug.id);
            return (
              <button
                key={`r-${drug.id}`}
                className={[
                  'tile',
                  'tile-right',
                  isMatched ? 'tile-matched' : '',
                  isSelected ? 'tile-selected' : '',
                  isWrong ? 'tile-wrong' : '',
                ].join(' ')}
                onClick={() => handleRightClick(idx)}
                disabled={isMatched}
                style={isSelected ? { borderColor: color, backgroundColor: `${color}18` } : {}}
              >
                {value}
              </button>
            );
          })}
        </div>
      </div>

      {/* Instruction note */}
      <p className="board-hint">
        Click a drug name, then click its matching {modeLabel.toLowerCase()}.
      </p>
    </div>
  );
}
