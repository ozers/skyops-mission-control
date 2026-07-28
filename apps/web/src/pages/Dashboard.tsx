import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import type {
  DroneResponse,
  DroneStatus,
  FleetHealthReport,
  MissionResponse,
  MissionStatus,
} from '@skyops/contracts';
import { api } from '../api';
import { StatusBadge } from '../components/StatusBadge';

const DAY = 24 * 60 * 60 * 1000;
const isActive = (status: MissionStatus): boolean =>
  status === 'PLANNED' || status === 'PRE_FLIGHT_CHECK' || status === 'IN_PROGRESS';

const STATUS_ORDER: DroneStatus[] = ['AVAILABLE', 'IN_MISSION', 'MAINTENANCE', 'RETIRED'];

export function Dashboard() {
  const [report, setReport] = useState<FleetHealthReport | null>(null);
  const [drones, setDrones] = useState<DroneResponse[]>([]);
  const [missions, setMissions] = useState<MissionResponse[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([api.fleetHealth(), api.listDrones(), api.listMissions()])
      .then(([fleet, dronePage, missionPage]) => {
        setReport(fleet);
        setDrones(dronePage.items);
        setMissions(missionPage.items);
      })
      .catch((err: Error) => setError(err.message));
  }, []);

  if (error) {
    return <p className="error">{error}</p>;
  }
  if (!report) {
    return <p className="loading">Loading fleet status</p>;
  }

  const now = Date.now();
  const available = report.dronesByStatus.AVAILABLE;
  const readiness =
    report.totalDrones === 0 ? 0 : Math.round((available / report.totalDrones) * 100);

  const dueSoon = drones
    .filter(
      (d) =>
        d.status !== 'RETIRED' &&
        d.nextMaintenanceDueAt !== null &&
        new Date(d.nextMaintenanceDueAt).getTime() <= now + 7 * DAY,
    )
    .sort(
      (a, b) =>
        new Date(a.nextMaintenanceDueAt as string).getTime() -
        new Date(b.nextMaintenanceDueAt as string).getTime(),
    );
  const upcoming = missions
    .filter((m) => isActive(m.status) && new Date(m.scheduledStart).getTime() >= now)
    .sort((a, b) => new Date(a.scheduledStart).getTime() - new Date(b.scheduledStart).getTime())
    .slice(0, 6);
  const recent = missions
    .filter((m) => m.status === 'COMPLETED' || m.status === 'ABORTED')
    .sort((a, b) => new Date(b.scheduledStart).getTime() - new Date(a.scheduledStart).getTime())
    .slice(0, 6);

  return (
    <section>
      <header className="masthead">
        <h2>Fleet health</h2>
        <p className="stamp">
          Report generated {new Date().toLocaleString()} · {report.totalDrones} airframes
        </p>
      </header>

      <div className="readout">
        <div className="readout-figure">
          <span className="figure">{readiness}</span>
          <span className="unit">%</span>
          <span className="caption">
            Fleet readiness
            <em>
              {available} of {report.totalDrones} available
            </em>
          </span>
        </div>

        <div className="readout-gauge">
          <div className="ticks" role="img" aria-label={`${readiness} percent ready`}>
            <div className="ticks-fill" style={{ width: `${readiness}%` }} />
          </div>
          <ul className="distribution">
            {STATUS_ORDER.map((status) => (
              <li key={status}>
                <span className="dist-value">{report.dronesByStatus[status]}</span>
                <span className={`dist-label dist-${status}`}>{status}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="metrics">
        <div>
          <span className="metric-value">{report.missionsNext24h}</span>
          <span className="metric-label">Missions next 24h</span>
        </div>
        <div>
          <span className="metric-value">{report.averageFlightHours.toFixed(1)}</span>
          <span className="metric-label">Avg flight hours</span>
        </div>
        <div className={report.overdueMaintenanceDroneIds.length > 0 ? 'is-signal' : ''}>
          <span className="metric-value">{report.overdueMaintenanceDroneIds.length}</span>
          <span className="metric-label">Overdue maintenance</span>
        </div>
      </div>

      <div className="columns">
        <div className="block">
          <header className="block-head">
            <span className="block-index">01</span>
            <h3>Maintenance alerts</h3>
            <span className="block-note">due within 7 days · {dueSoon.length}</span>
          </header>
          {dueSoon.length === 0 ? (
            <p className="empty">No drones due for maintenance in the next 7 days.</p>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Serial</th>
                    <th>Status</th>
                    <th>Due</th>
                  </tr>
                </thead>
                <tbody>
                  {dueSoon.map((drone) => {
                    const due = new Date(drone.nextMaintenanceDueAt as string);
                    const overdue = due.getTime() < now;
                    return (
                      <tr key={drone.id} className={overdue ? 'overdue' : undefined}>
                        <td>
                          <Link to={`/drones/${drone.id}`}>{drone.serialNumber}</Link>
                        </td>
                        <td>
                          <StatusBadge status={drone.status} />
                        </td>
                        <td className="mono">
                          {due.toLocaleDateString()}
                          {overdue && <span className="flag">Overdue</span>}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="stack">
          <div className="block">
            <header className="block-head">
              <span className="block-index">02</span>
              <h3>Upcoming</h3>
              <span className="block-note">{upcoming.length}</span>
            </header>
            <MissionFeed missions={upcoming} />
          </div>
          <div className="block">
            <header className="block-head">
              <span className="block-index">03</span>
              <h3>Recent</h3>
              <span className="block-note">{recent.length}</span>
            </header>
            <MissionFeed missions={recent} />
          </div>
        </div>
      </div>
    </section>
  );
}

function MissionFeed({ missions }: { missions: MissionResponse[] }) {
  if (missions.length === 0) {
    return <p className="empty">Nothing to show.</p>;
  }
  return (
    <ul className="feed">
      {missions.map((mission) => (
        <li key={mission.id}>
          <StatusBadge status={mission.status} />
          <span className="name">{mission.name}</span>
          <time>{new Date(mission.scheduledStart).toLocaleDateString()}</time>
        </li>
      ))}
    </ul>
  );
}
