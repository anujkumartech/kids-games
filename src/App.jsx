import { Navigate, Route, Routes } from 'react-router-dom'
import ShapeCountingQuest from './pages/ShapeCountingQuest.jsx'

function App() {
  return (
    <Routes>
      <Route path="/" element={<ShapeCountingQuest />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
