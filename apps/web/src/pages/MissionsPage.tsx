import { ChangeEvent, FormEvent, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  MISSION_STATUSES,
  MISSION_TYPES,
  type DroneResponse,
  type MissionResponse,
  type MissionStatus,
  type MissionType,
} from '@skyops/contracts';
import { api } from '../api';
import { Pagination } from '../components/Pagination';
import { StatusBadge } from '../components/StatusBadge';

const NEXT_STATE: Partial<Record<MissionStatus, MissionStatus>> = {
  PLANNED: 'PRE_FLIGHT_CHECK',
  PRE_FLIGHT_CHECK: 'IN_PROGRESS',
  IN_PROGRESS: 'COMPLETED',
};

interface FormState {
  name: string;
  type: MissionType;
  droneId: string;
  pilotName: string;
  siteLocation: string;
  scheduledStart: string;
  scheduledEnd: string;
}

const EMPTY: FormState = {
  name: '',
  type: 'WIND_TURBINE_INSPECTION',
  droneId: '',
  pilotName: '',
  siteLocation: '',
  scheduledStart: '',
  scheduledEnd: '',
};

/* Completing and aborting need operator input, so the row asks before it acts. */
interface PendingAction {
  missionId: string;
  kind: 'complete' | 'abort';
}

export function MissionsPage() {
  const [missions, setMissions] = useState<MissionResponse[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [drones, setDrones] = useState<DroneResponse[]>([]);
  const [form, setForm] = useState<FormState>(EMPTY);
  const [filter, setFilter] = useState<MissionStatus | ''>('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [busyMissionId, setBusyMissionId] = useState<string | null>(null);
  const [pending, setPending] = useState<PendingAction | null>(null);
  const [pendingValue, setPendingValue] = useState('');

  /* Paging and filtering happen server-side; the drone options need the whole fleet. */
  const load = async (target = page, status = filter, size = pageSize): Promise<void> => {
    const [missionPage, dronePage] = await Promise.all([
      api.listMissions({ page: target, pageSize: size, ...(status ? { status } : {}) }),
      api.listDrones({ pageSize: 100 }),
    ]);
    setMissions(missionPage.items);
    setTotal(missionPage.total);
    setDrones(dronePage.items);
  };

  useEffect(() => {
    setLoading(true);
    load(page, filter, pageSize)
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
    /* eslint-disable-next-line react-hooks/exhaustive-deps */
  }, [page, filter, pageSize]);

  const set =
    (key: keyof FormState) => (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm((current) => ({ ...current, [key]: event.target.value }) as FormState);

  const submit = async (event: FormEvent): Promise<void> => {
    event.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await api.createMission({
        ...form,
        scheduledStart: new Date(form.scheduledStart).toISOString(),
        scheduledEnd: new Date(form.scheduledEnd).toISOString(),
      });
      setForm(EMPTY);
      /* The list is newest-first, so a fresh mission lands on page one. */
      if (page === 1 && !filter) {
        await load(1, '', pageSize);
      } else {
        setFilter('');
        setPage(1);
      }
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  const runTransition = async (
    missionId: string,
    to: MissionStatus,
    extra: { flightHoursLogged?: number; abortReason?: string },
  ): Promise<void> => {
    setError(null);
    setBusyMissionId(missionId);
    try {
      await api.transitionMission(missionId, { to, ...extra });
      setPending(null);
      setPendingValue('');
      await load();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusyMissionId(null);
    }
  };

  const advance = (mission: MissionResponse): void => {
    const to = NEXT_STATE[mission.status];
    if (!to) {
      return;
    }
    /* Completing requires logged hours, so collect them first. */
    if (to === 'COMPLETED') {
      setPending({ missionId: mission.id, kind: 'complete' });
      setPendingValue('');
      return;
    }
    void runTransition(mission.id, to, {});
  };

  const confirmPending = (event: FormEvent): void => {
    event.preventDefault();
    if (!pending) {
      return;
    }
    if (pending.kind === 'complete') {
      void runTransition(pending.missionId, 'COMPLETED', {
        flightHoursLogged: Number(pendingValue),
      });
      return;
    }
    void runTransition(pending.missionId, 'ABORTED', { abortReason: pendingValue });
  };

  const cancelPending = (): void => {
    setPending(null);
    setPendingValue('');
  };

  const availableDrones = drones.filter((drone) => drone.status === 'AVAILABLE');
  const isTerminal = (status: MissionStatus): boolean =>
    status === 'COMPLETED' || status === 'ABORTED';
  const serialByDroneId = new Map(drones.map((drone) => [drone.id, drone.serialNumber]));

  /* Date on one line, the time range under it, so the column stays narrow. */
  const formatWindow = (mission: MissionResponse): { date: string; time: string } => {
    const start = new Date(mission.scheduledStart);
    const end = new Date(mission.scheduledEnd);
    const day = (d: Date): string =>
      d.toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' });
    const clock = (d: Date): string =>
      d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', hour12: false });
    const sameDay = start.toDateString() === end.toDateString();
    return {
      date: day(start),
      time: sameDay ? `${clock(start)}–${clock(end)}` : `${clock(start)} → ${day(end)}`,
    };
  };

  const outcomeOf = (mission: MissionResponse): string => {
    if (mission.status === 'COMPLETED') {
      return mission.loggedFlightHours === null ? '—' : `${mission.loggedFlightHours} h logged`;
    }
    if (mission.status === 'ABORTED') {
      return mission.abortReason ?? '—';
    }
    return '—';
  };

  return (
    <section>
      <header className="masthead">
        <h2>Missions</h2>
        <p className="stamp">Schedule inspections and drive them through the lifecycle</p>
      </header>

      <div className="block">
        <header className="block-head">
          <span className="block-index">01</span>
          <h3>Schedule a mission</h3>
        </header>
        <form onSubmit={submit}>
          <label className="field">
            <span>Name</span>
            <input
              placeholder="Turbine A sweep"
              aria-label="name"
              value={form.name}
              onChange={set('name')}
              required
            />
          </label>
          <label className="field">
            <span>Type</span>
            <select aria-label="type" value={form.type} onChange={set('type')}>
              {MISSION_TYPES.map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
          </label>
          <label className="field">
            <span>Drone</span>
            <select aria-label="drone" value={form.droneId} onChange={set('droneId')} required>
              <option value="">Select drone</option>
              {availableDrones.map((drone) => (
                <option key={drone.id} value={drone.id}>
                  {drone.serialNumber}
                </option>
              ))}
            </select>
          </label>
          <label className="field">
            <span>Pilot</span>
            <input
              placeholder="Jane Doe"
              aria-label="pilot"
              value={form.pilotName}
              onChange={set('pilotName')}
              required
            />
          </label>
          <label className="field">
            <span>Site</span>
            <input
              placeholder="North-3"
              aria-label="site"
              value={form.siteLocation}
              onChange={set('siteLocation')}
              required
            />
          </label>
          <label className="field">
            <span>Start</span>
            <input
              type="datetime-local"
              aria-label="start"
              value={form.scheduledStart}
              onChange={set('scheduledStart')}
              required
            />
          </label>
          <label className="field">
            <span>End</span>
            <input
              type="datetime-local"
              aria-label="end"
              value={form.scheduledEnd}
              onChange={set('scheduledEnd')}
              required
            />
          </label>
          <button type="submit" disabled={submitting}>
            Schedule mission
          </button>
        </form>
      </div>

      {error && (
        <p className="error" role="alert">
          {error}
        </p>
      )}

      <div className="block">
        <header className="block-head">
          <span className="block-index">02</span>
          <h3>Schedule</h3>
          <span className="block-note">{total} missions</span>
          <select
            aria-label="status filter"
            value={filter}
            onChange={(e) => {
              setPage(1);
              setFilter(e.target.value as MissionStatus | '');
            }}
          >
            <option value="">All statuses</option>
            {MISSION_STATUSES.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </header>
        {loading ? (
          <p className="loading">Loading missions</p>
        ) : (
          <div className="table-wrap scroll-y">
            <table>
              <thead>
                <tr>
                  <th>Mission</th>
                  <th>Drone</th>
                  <th>Window</th>
                  <th>Status</th>
                  <th>Outcome</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {missions.map((mission) => {
                  const isPending = pending?.missionId === mission.id;
                  const busy = busyMissionId === mission.id;
                  return (
                    <tr key={mission.id}>
                      <td>
                        {mission.name}
                        <span className="sub">
                          {mission.type} · {mission.siteLocation} · {mission.pilotName}
                        </span>
                      </td>
                      <td>
                        <Link to={`/drones/${mission.droneId}`}>
                          {serialByDroneId.get(mission.droneId) ?? 'unknown'}
                        </Link>
                      </td>
                      <td className="mono">
                        {formatWindow(mission).date}
                        <span className="sub">{formatWindow(mission).time}</span>
                      </td>
                      <td>
                        <StatusBadge status={mission.status} />
                      </td>
                      <td className="quiet">{outcomeOf(mission)}</td>
                      <td className="actions">
                        {isPending ? (
                          <form className="inline-prompt" onSubmit={confirmPending}>
                            {pending.kind === 'complete' ? (
                              <input
                                type="number"
                                step="0.1"
                                min="0.1"
                                aria-label="flight hours"
                                placeholder="Flight hours"
                                value={pendingValue}
                                onChange={(e) => setPendingValue(e.target.value)}
                                required
                                autoFocus
                              />
                            ) : (
                              <input
                                aria-label="abort reason"
                                placeholder="Reason"
                                value={pendingValue}
                                onChange={(e) => setPendingValue(e.target.value)}
                                required
                                autoFocus
                              />
                            )}
                            <button type="submit" disabled={busy}>
                              Confirm
                            </button>
                            <button type="button" onClick={cancelPending}>
                              Cancel
                            </button>
                          </form>
                        ) : (
                          <>
                            {NEXT_STATE[mission.status] && (
                              <button onClick={() => advance(mission)} disabled={busy}>
                                Advance to {NEXT_STATE[mission.status]}
                              </button>
                            )}
                            {!isTerminal(mission.status) && (
                              <button
                                onClick={() => {
                                  setPending({ missionId: mission.id, kind: 'abort' });
                                  setPendingValue('');
                                }}
                                disabled={busy}
                              >
                                Abort
                              </button>
                            )}
                          </>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
        <Pagination
          page={page}
          pageSize={pageSize}
          total={total}
          onChange={setPage}
          onPageSizeChange={(size) => {
            setPage(1);
            setPageSize(size);
          }}
          label="Missions"
        />
      </div>
    </section>
  );
}
