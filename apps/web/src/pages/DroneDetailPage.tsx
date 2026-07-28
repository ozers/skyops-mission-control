import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import type { DroneResponse, MaintenanceLogResponse, MissionResponse } from '@skyops/contracts';
import { api } from '../api';
import { StatusBadge } from '../components/StatusBadge';

export function DroneDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [drone, setDrone] = useState<DroneResponse | null>(null);
  const [missions, setMissions] = useState<MissionResponse[]>([]);
  const [logs, setLogs] = useState<MaintenanceLogResponse[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      return;
    }
    Promise.all([api.getDrone(id), api.missionsForDrone(id), api.listMaintenanceLogs(id)])
      .then(([droneData, missionPage, logPage]) => {
        setDrone(droneData);
        setMissions(missionPage.items);
        setLogs(logPage.items);
      })
      .catch((err: Error) => setError(err.message));
  }, [id]);

  if (error) {
    return <p className="error">{error}</p>;
  }
  if (!drone) {
    return <p className="loading">Loading drone</p>;
  }

  const formatDate = (value: string | null): string =>
    value ? new Date(value).toLocaleDateString() : '—';

  return (
    <section>
      <Link to="/drones" className="back-link">
        Back to registry
      </Link>

      <header className="masthead is-detail">
        <h2>{drone.serialNumber}</h2>
        <StatusBadge status={drone.status} />
      </header>

      <dl className="specs">
        <div>
          <dt>Model</dt>
          <dd>{drone.model}</dd>
        </div>
        <div>
          <dt>Total flight hours</dt>
          <dd>{drone.totalFlightHours}</dd>
        </div>
        <div>
          <dt>Last maintenance</dt>
          <dd>{formatDate(drone.lastMaintenanceAt)}</dd>
        </div>
        <div>
          <dt>Next due</dt>
          <dd>{formatDate(drone.nextMaintenanceDueAt)}</dd>
        </div>
      </dl>

      <div className="block">
        <header className="block-head">
          <span className="block-index">01</span>
          <h3>Mission history</h3>
          <span className="block-note">{missions.length}</span>
        </header>
        {missions.length === 0 ? (
          <p className="empty">No missions for this drone.</p>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Type</th>
                  <th>Status</th>
                  <th>Scheduled</th>
                </tr>
              </thead>
              <tbody>
                {missions.map((mission) => (
                  <tr key={mission.id}>
                    <td>{mission.name}</td>
                    <td className="quiet">{mission.type}</td>
                    <td>
                      <StatusBadge status={mission.status} />
                    </td>
                    <td className="mono">{new Date(mission.scheduledStart).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="block">
        <header className="block-head">
          <span className="block-index">02</span>
          <h3>Maintenance history</h3>
          <span className="block-note">{logs.length}</span>
        </header>
        {logs.length === 0 ? (
          <p className="empty">No maintenance logs for this drone.</p>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Type</th>
                  <th>Technician</th>
                  <th>Performed</th>
                  <th className="num">Hours</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log.id}>
                    <td>{log.type}</td>
                    <td className="quiet">{log.technicianName}</td>
                    <td className="mono">{new Date(log.performedAt).toLocaleDateString()}</td>
                    <td className="num">{log.flightHoursAtMaintenance}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}
