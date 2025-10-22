import { useEffect, useMemo, useRef, useState } from 'react'
import '../App.css'

const TOTAL_SHAPES = 6

const SHAPE_TYPES = [
  { id: 'square', singular: 'square', plural: 'squares' },
  { id: 'circle', singular: 'circle', plural: 'circles' },
  { id: 'triangle', singular: 'triangle', plural: 'triangles' },
  { id: 'diamond', singular: 'diamond', plural: 'diamonds' },
]

const COLOR_PALETTE = [
  '#f97316',
  '#facc15',
  '#34d399',
  '#60a5fa',
  '#a855f7',
  '#f43f5e',
  '#22d3ee',
]

const shuffle = (array) => {
  const items = [...array]

  for (let index = items.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1))
    ;[items[index], items[swapIndex]] = [items[swapIndex], items[index]]
  }

  return items
}

const randomItem = (items) => items[Math.floor(Math.random() * items.length)]

const createOptions = (correctCount) => {
  const choices = new Set([correctCount])
  const maxValue = TOTAL_SHAPES + 3

  while (choices.size < 4) {
    const candidate = Math.floor(Math.random() * (maxValue + 1))
    choices.add(candidate)
  }

  return shuffle([...choices])
}

const generateAssignment = () => {
  const assignmentId = `${Date.now()}-${Math.floor(Math.random() * 10000)}`

  const shapes = Array.from({ length: TOTAL_SHAPES }, (_, index) => {
    const type = randomItem(SHAPE_TYPES).id
    const color = randomItem(COLOR_PALETTE)

    return {
      id: `${assignmentId}-${index}`,
      type,
      color,
    }
  })

  const targetTypeId = randomItem(shapes).type
  const targetShape =
    SHAPE_TYPES.find((shapeType) => shapeType.id === targetTypeId) ??
    SHAPE_TYPES[0]

  const correctCount = shapes.filter(
    (shape) => shape.type === targetShape.id,
  ).length

  const options = createOptions(correctCount)

  return {
    id: assignmentId,
    shapes,
    target: targetShape,
    correctCount,
    options,
  }
}

const createConfettiPieces = (count = 90) =>
  Array.from({ length: count }, (_, index) => {
    const size = 8 + Math.random() * 7

    return {
      id: `confetti-${index}-${Math.floor(Math.random() * 10000)}`,
      left: Math.random() * 100,
      delay: Math.random() * 0.25,
      duration: 1 + Math.random() * 0.75,
      rotation: Math.floor(Math.random() * 360),
      drift: Math.floor(Math.random() * 140) - 70,
      color: randomItem(COLOR_PALETTE),
      width: size,
      height: size * (0.9 + Math.random()),
    }
  })

function ShapeCountingQuest() {
  const [round, setRound] = useState(1)
  const [assignment, setAssignment] = useState(generateAssignment)
  const [status, setStatus] = useState({
    type: 'info',
    message: 'Tap the right number to move on.',
  })
  const [selectedOption, setSelectedOption] = useState(null)
  const [isLocked, setIsLocked] = useState(false)
  const [showConfetti, setShowConfetti] = useState(false)
  const [confettiSeed, setConfettiSeed] = useState(0)
  const [isErrorFlash, setIsErrorFlash] = useState(false)
  const nextRoundTimeout = useRef(null)
  const confettiTimeout = useRef(null)
  const errorTimeout = useRef(null)

  useEffect(
    () => () => {
      if (nextRoundTimeout.current) {
        clearTimeout(nextRoundTimeout.current)
      }
      if (confettiTimeout.current) {
        clearTimeout(confettiTimeout.current)
      }
      if (errorTimeout.current) {
        clearTimeout(errorTimeout.current)
      }
    },
    [],
  )

  const handleOptionClick = (value) => {
    if (isLocked) {
      return
    }

    setSelectedOption(value)

    if (value === assignment.correctCount) {
      setIsLocked(true)
      setIsErrorFlash(false)
      setShowConfetti(true)
      setConfettiSeed((seed) => seed + 1)
      if (confettiTimeout.current) {
        clearTimeout(confettiTimeout.current)
      }
      confettiTimeout.current = setTimeout(() => {
        setShowConfetti(false)
      }, 1200)
      setStatus({
        type: 'success',
        message: 'Fantastic! New challenge coming right up!',
      })

      nextRoundTimeout.current = setTimeout(() => {
        setAssignment(generateAssignment())
        setRound((current) => current + 1)
        setSelectedOption(null)
        setStatus({
          type: 'info',
          message: 'Tap the right number to move on.',
        })
        setIsLocked(false)
      }, 1200)
    } else {
      setIsErrorFlash(true)
      if (errorTimeout.current) {
        clearTimeout(errorTimeout.current)
      }
      errorTimeout.current = setTimeout(() => {
        setIsErrorFlash(false)
      }, 1000)
      setStatus({
        type: 'error',
        message: 'Not quite. Try a different number!',
      })
    }
  }

  const shapeLabel =
    assignment.correctCount === 1
      ? assignment.target.singular
      : assignment.target.plural

  const containerClassName = ['game', isErrorFlash ? 'game--error' : '']
    .filter(Boolean)
    .join(' ')

  return (
    <div className={containerClassName}>
      {showConfetti ? <ConfettiOverlay seed={confettiSeed} /> : null}
      <header className="game__header">
        <div>
          <p className="game__badge">Round {round}</p>
          <h1>Shape Counting Quest</h1>
        </div>
      </header>

      <section className="game__options" aria-label="Answer choices">
        {assignment.options.map((option) => {
          const isSelected = selectedOption === option
          const isCorrect = option === assignment.correctCount

          const className = [
            'option-button',
            isSelected && isCorrect ? 'option-button--correct' : '',
            isSelected && !isCorrect ? 'option-button--wrong' : '',
          ]
            .filter(Boolean)
            .join(' ')

          return (
            <button
              key={`${assignment.id}-option-${option}`}
              type="button"
              className={className}
              onClick={() => handleOptionClick(option)}
              disabled={isLocked}
              aria-label={`${option} ${option === 1 ? 'shape' : 'shapes'}`}
            >
              {option}
            </button>
          )
        })}
      </section>

      <section className="game__question" aria-live="polite">
        <p>
          How many <span className="highlight">{shapeLabel}</span> do you see?
        </p>
      </section>

      <section className="game__board" aria-label="Shapes to count">
        {assignment.shapes.map((shape) => (
          <div key={shape.id} className="shape-card">
            <ShapeSvg type={shape.type} color={shape.color} />
          </div>
        ))}
      </section>

      <footer
        className={`game__status game__status--${status.type}`}
        role="status"
      >
        {status.message}
      </footer>
    </div>
  )
}

function ConfettiOverlay({ seed }) {
  const pieces = useMemo(() => createConfettiPieces(), [seed])

  return (
    <div className="confetti" aria-hidden="true">
      {pieces.map((piece) => (
        <span
          key={piece.id}
          className="confetti__piece"
          style={{
            left: `${piece.left}%`,
            width: `${piece.width}px`,
            height: `${piece.height}px`,
            backgroundColor: piece.color,
            animationDelay: `${piece.delay}s`,
            animationDuration: `${piece.duration}s`,
            '--confetti-rotation': `${piece.rotation}deg`,
            '--confetti-drift': `${piece.drift}px`,
          }}
        />
      ))}
    </div>
  )
}

function ShapeSvg({ type, color }) {
  switch (type) {
    case 'square':
      return (
        <svg className="shape" viewBox="0 0 96 96" role="img" aria-label="Square">
          <rect x="12" y="12" width="72" height="72" rx="14" fill={color} />
        </svg>
      )
    case 'circle':
      return (
        <svg className="shape" viewBox="0 0 96 96" role="img" aria-label="Circle">
          <circle cx="48" cy="48" r="36" fill={color} />
        </svg>
      )
    case 'triangle':
      return (
        <svg
          className="shape"
          viewBox="0 0 96 96"
          role="img"
          aria-label="Triangle"
        >
          <polygon points="48 12, 88 84, 8 84" fill={color} />
        </svg>
      )
    case 'diamond':
      return (
        <svg
          className="shape"
          viewBox="0 0 96 96"
          role="img"
          aria-label="Diamond"
        >
          <polygon points="48 8, 88 48, 48 88, 8 48" fill={color} />
        </svg>
      )
    default:
      return null
  }
}

export default ShapeCountingQuest
