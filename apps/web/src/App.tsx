import { NavLink, Route, Routes } from 'react-router-dom';
import { Dashboard } from './pages/Dashboard';
import { DroneDetailPage } from './pages/DroneDetailPage';
import { DronesPage } from './pages/DronesPage';
import { MissionsPage } from './pages/MissionsPage';

const SECTIONS = [
  { to: '/', label: 'Dashboard', index: '01' },
  { to: '/drones', label: 'Drones', index: '02' },
  { to: '/missions', label: 'Missions', index: '03' },
];

export function App() {
  return (
    <div className="app">
      <aside>
        <div className="brand">
          <span className="brand-tag">Fleet ops terminal</span>
          <h1>SkyOps Mission Control</h1>
        </div>
        <nav>
          {SECTIONS.map((section) => (
            <NavLink key={section.to} to={section.to} end={section.to === '/'}>
              <span className="idx">{section.index}</span>
              {section.label}
            </NavLink>
          ))}
        </nav>
        <footer>
          <span className="live" />
          Systems nominal
        </footer>
      </aside>
      <main>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/drones" element={<DronesPage />} />
          <Route path="/drones/:id" element={<DroneDetailPage />} />
          <Route path="/missions" element={<MissionsPage />} />
        </Routes>
      </main>
    </div>
  );
}
