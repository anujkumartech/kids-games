import { NavLink, Navigate, Outlet, Route, Routes } from 'react-router-dom'
import ShapeCountingQuest from './pages/ShapeCountingQuest.jsx'
import ColoringGarden from './pages/ColoringGarden.jsx'

function AppLayout() {
  return (
    <div className="app-shell">
      <header className="app-shell__nav">
        <nav className="app-nav">
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              ['app-nav__link', isActive ? 'app-nav__link--active' : '']
                .filter(Boolean)
                .join(' ')
            }
          >
            Shape Counting
          </NavLink>
          <NavLink
            to="/coloring"
            className={({ isActive }) =>
              ['app-nav__link', isActive ? 'app-nav__link--active' : '']
                .filter(Boolean)
                .join(' ')
            }
          >
            Coloring Garden
          </NavLink>
        </nav>
      </header>
      <main className="app-shell__main">
        <Outlet />
      </main>
    </div>
  )
}

function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route index element={<ShapeCountingQuest />} />
        <Route path="coloring" element={<ColoringGarden />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
