import { useState, useEffect } from 'react'
import TopicSelect from './components/TopicSelect'
import StartScreen from './components/StartScreen'
import GameBoard from './components/GameBoard'
import ResultsScreen from './components/ResultsScreen'
import { useGameSession } from './hooks/useGameSession'
import { usePersonalBest } from './hooks/usePersonalBest'
import topics from './data/topics'

export default function App() {
  const { state, start, answer, next, reset } = useGameSession()
  const { getBest, getAllBests, saveBest } = usePersonalBest()
  const [personalBests, setPersonalBests] = useState({})
  const [savedResult,   setSavedResult]   = useState(null)
  const [topic,         setTopic]         = useState(null)

  useEffect(() => { setPersonalBests(getAllBests()) }, [getAllBests])

  useEffect(() => {
    if (state.status === 'finished' && state.config) {
      const prev  = getBest(state.config)
      const isNew = saveBest(state.config, state.score, state.queue.length)
      setSavedResult({ newRecord: isNew, best: prev })
      setPersonalBests(getAllBests())
    }
  }, [state.status])

  function handleStart(drugs, config) {
    setSavedResult(null)
    start(drugs, config)
  }

  function handlePlayAgain() {
    setSavedResult(null)
    start(state.queue, state.config)
  }

  /** Back to this topic's setup screen. */
  function handleHome() {
    setSavedResult(null)
    reset()
    setPersonalBests(getAllBests())
  }

  /** Back to the subject directory. */
  function handleAllTopics() {
    setSavedResult(null)
    reset()
    setTopic(null)
    setPersonalBests(getAllBests())
  }

  if (state.status === 'playing') {
    return <GameBoard state={state} answer={answer} next={next} reset={handleHome} />
  }

  if (state.status === 'finished') {
    return (
      <ResultsScreen
        results={state.results}
        score={state.score}
        config={state.config}
        personalBest={savedResult?.best}
        newRecord={savedResult?.newRecord}
        onPlayAgain={handlePlayAgain}
        onHome={handleHome}
        onAllTopics={handleAllTopics}
      />
    )
  }

  if (!topic) {
    return (
      <TopicSelect
        topics={topics}
        personalBests={personalBests}
        onPick={setTopic}
      />
    )
  }

  return (
    <StartScreen
      topic={topic}
      personalBests={personalBests}
      onStart={handleStart}
      onBack={handleAllTopics}
    />
  )
}
