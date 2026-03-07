import { useState } from 'react';
import HomeScreen from './components/HomeScreen';
import QuizScreen from './components/QuizScreen';
import ResultScreen from './components/ResultScreen';
import './App.css';

/**
 * Top-level routing between the three screens:
 *   'home'   – category / mode selection
 *   'quiz'   – matching game
 *   'result' – score summary
 */
function App() {
  const [screen, setScreen] = useState('home');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedMode, setSelectedMode] = useState('class');
  const [quizScore, setQuizScore] = useState(null);
  const [quizTotalDrugs, setQuizTotalDrugs] = useState(0);

  function handleStartQuiz(category, mode) {
    setSelectedCategory(category);
    setSelectedMode(mode);
    setQuizScore(null);
    setScreen('quiz');
  }

  function handleQuizComplete(score, totalDrugs) {
    setQuizScore(score);
    setQuizTotalDrugs(totalDrugs);
    setScreen('result');
  }

  function handlePlayAgain() {
    setQuizScore(null);
    setScreen('quiz');
  }

  function handleHome() {
    setScreen('home');
    setSelectedCategory(null);
    setQuizScore(null);
  }

  return (
    <div className="app-container">
      {screen === 'home' && (
        <HomeScreen onStartQuiz={handleStartQuiz} />
      )}
      {screen === 'quiz' && selectedCategory && (
        <QuizScreen
          category={selectedCategory}
          mode={selectedMode}
          onComplete={handleQuizComplete}
          onExit={handleHome}
        />
      )}
      {screen === 'result' && quizScore && (
        <ResultScreen
          score={quizScore}
          totalDrugs={quizTotalDrugs}
          category={selectedCategory}
          mode={selectedMode}
          onPlayAgain={handlePlayAgain}
          onHome={handleHome}
        />
      )}
    </div>
  );
}

export default App;
