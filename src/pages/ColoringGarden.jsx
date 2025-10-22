import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import '../App.css'

const DEFAULT_BOARD_SIZE = 420
const BRUSH_SIZE = 26

const COLOR_PALETTE = [
  '#ef4444',
  '#f97316',
  '#facc15',
  '#4ade80',
  '#22d3ee',
  '#60a5fa',
  '#818cf8',
  '#a855f7',
  '#ec4899',
  '#fb7185',
]

const SHAPES = [
  { id: 'circle', label: 'Circle' },
  { id: 'square', label: 'Square' },
  { id: 'triangle', label: 'Triangle' },
  { id: 'star', label: 'Star' },
]

const randomShapeIndex = (current) => {
  if (SHAPES.length <= 1) {
    return 0
  }

  let next = current
  while (next === current) {
    next = Math.floor(Math.random() * SHAPES.length)
  }

  return next
}

function ColoringGarden() {
  const canvasRef = useRef(null)
  const boardRef = useRef(null)
  const isDrawingRef = useRef(false)
  const lastPointRef = useRef(null)
  const [shapeIndex, setShapeIndex] = useState(0)
  const [currentColor, setCurrentColor] = useState(COLOR_PALETTE[0])
  const [controlsEnabled, setControlsEnabled] = useState(false)
  const [boardSize, setBoardSize] = useState(DEFAULT_BOARD_SIZE)
  const boardSizeRef = useRef(DEFAULT_BOARD_SIZE)

  const currentShape = useMemo(() => SHAPES[shapeIndex], [shapeIndex])

  const initialiseCanvas = useCallback((size) => {
    const canvas = canvasRef.current
    if (!canvas) {
      return
    }

    const context = canvas.getContext('2d')
    const pixelRatio = window.devicePixelRatio || 1

    canvas.width = size * pixelRatio
    canvas.height = size * pixelRatio
    canvas.style.width = `${size}px`
    canvas.style.height = `${size}px`

    context.setTransform(1, 0, 0, 1, 0, 0)
    context.scale(pixelRatio, pixelRatio)
    context.lineCap = 'round'
    context.lineJoin = 'round'
    context.lineWidth = BRUSH_SIZE
    context.clearRect(0, 0, size, size)

    lastPointRef.current = null
  }, [])

  const clearCanvas = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) {
      return
    }

    const context = canvas.getContext('2d')
    const size = boardSizeRef.current

    context.save()
    const pixelRatio = window.devicePixelRatio || 1
    context.setTransform(1, 0, 0, 1, 0, 0)
    context.scale(pixelRatio, pixelRatio)
    context.clearRect(0, 0, size, size)
    context.restore()

    lastPointRef.current = null
  }, [])

  useEffect(() => {
    initialiseCanvas(boardSizeRef.current)
  }, [initialiseCanvas, shapeIndex, boardSize])

  useEffect(() => {
    const boardElement = boardRef.current
    if (!boardElement) {
      return
    }

    const updateSize = () => {
      const rect = boardElement.getBoundingClientRect()
      const size = Math.min(rect.width, rect.height)
      if (!size) {
        return
      }
      if (Math.abs(size - boardSizeRef.current) > 0.5) {
        boardSizeRef.current = size
        setBoardSize(size)
      }
    }

    updateSize()

    const observer = new ResizeObserver(updateSize)
    observer.observe(boardElement)

    return () => {
      observer.disconnect()
    }
  }, [])

  const getPointFromEvent = useCallback((event) => {
    const canvas = canvasRef.current
    if (!canvas) {
      return null
    }

    const rect = canvas.getBoundingClientRect()
    const clientX = event.clientX ?? event.touches?.[0]?.clientX
    const clientY = event.clientY ?? event.touches?.[0]?.clientY

    if (clientX == null || clientY == null) {
      return null
    }

    const targetSize = boardSizeRef.current

    const x = ((clientX - rect.left) / rect.width) * targetSize
    const y = ((clientY - rect.top) / rect.height) * targetSize

    return { x, y }
  }, [])

  const drawStroke = useCallback(
    (point, isInitial = false) => {
      const canvas = canvasRef.current
      if (!canvas) {
        return
      }

      const context = canvas.getContext('2d')
      context.strokeStyle = currentColor
      context.fillStyle = currentColor
      context.lineWidth = BRUSH_SIZE

      const previousPoint = lastPointRef.current

      if (isInitial || !previousPoint) {
        context.beginPath()
        context.arc(point.x, point.y, BRUSH_SIZE / 2, 0, Math.PI * 2)
        context.fill()
      } else {
        context.beginPath()
        context.moveTo(previousPoint.x, previousPoint.y)
        context.lineTo(point.x, point.y)
        context.stroke()
      }

      lastPointRef.current = point
    },
    [currentColor],
  )

  const handlePointerDown = (event) => {
    event.preventDefault()
    const point = getPointFromEvent(event)
    if (!point) {
      return
    }

    isDrawingRef.current = true
    drawStroke(point, true)
  }

  const handlePointerMove = (event) => {
    if (!isDrawingRef.current) {
      return
    }

    const point = getPointFromEvent(event)
    if (!point) {
      return
    }

    drawStroke(point)
  }

  const finishDrawing = () => {
    isDrawingRef.current = false
    lastPointRef.current = null
  }

  const handleReloadShape = () => {
    clearCanvas()
  }

  const handleNewShape = () => {
    setShapeIndex((current) => randomShapeIndex(current))
  }

  const handleToggleChange = (event) => {
    setControlsEnabled(event.target.checked)
  }

  return (
    <div className="coloring">
      <header className="coloring__header">
        <div>
          <p className="coloring__badge">Creative Corner</p>
          <h1>Coloring Garden</h1>
          <p className="coloring__subtitle">
            Pick a color, drag to paint, and bring each shape to life!
          </p>
        </div>
        <div className="coloring__shape-indicator">
          <span>Current shape</span>
          <strong>{currentShape.label}</strong>
        </div>
      </header>

      <section className="coloring__workspace">
        <div
          ref={boardRef}
          className={`coloring-board coloring-board--${currentShape.id}`}
        >
          <div
            className={`coloring-board__shape coloring-board__shape--${currentShape.id}`}
          />
          <canvas
            ref={canvasRef}
            className={`coloring-board__canvas coloring-board__canvas--${currentShape.id}`}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={finishDrawing}
            onPointerLeave={finishDrawing}
            onPointerCancel={finishDrawing}
          />
        </div>

        <aside className="coloring__controls">
          <div className="coloring__palette">
            {COLOR_PALETTE.map((color) => {
              const isActive = currentColor === color
              const className = [
                'coloring__color-button',
                isActive ? 'coloring__color-button--active' : '',
              ]
                .filter(Boolean)
                .join(' ')

              return (
                <button
                  key={color}
                  type="button"
                  className={className}
                  style={{ backgroundColor: color }}
                  aria-label={`Select color ${color}`}
                  onClick={() => setCurrentColor(color)}
                />
              )
            })}
          </div>

          <div className="coloring__toggle">
            <label className="switch">
              <input
                type="checkbox"
                checked={controlsEnabled}
                onChange={handleToggleChange}
              />
              <span className="switch__slider" />
            </label>
            <span>Enable shape controls</span>
          </div>

          <div className="coloring__actions">
            <button
              type="button"
              onClick={handleReloadShape}
              disabled={!controlsEnabled}
            >
              Reload current shape
            </button>
            <button
              type="button"
              onClick={handleNewShape}
              disabled={!controlsEnabled}
            >
              Surprise me with a new shape
            </button>
          </div>

          <p className="coloring__hint">
            Tip: Use bold strokes to fill the shape quickly. Toggle controls to
            reset or change the shape when you are ready for a new challenge.
          </p>
        </aside>
      </section>
    </div>
  )
}

export default ColoringGarden
