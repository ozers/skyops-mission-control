import { FormEvent, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { DRONE_MODELS, type DroneModel, type DroneResponse } from '@skyops/contracts';
import { api } from '../api';
import { Pagination } from '../components/Pagination';
import { StatusBadge } from '../components/StatusBadge';

export function DronesPage() {
  const [drones, setDrones] = useState<DroneResponse[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [serialNumber, setSerialNumber] = useState('');
  const [model, setModel] = useState<DroneModel>('PHANTOM_4');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const load = (target = page, size = pageSize): Promise<void> =>
    api.listDrones({ page: target, pageSize: size }).then((result) => {
      setDrones(result.items);
      setTotal(result.total);
    });

  useEffect(() => {
    setLoading(true);
    load(page, pageSize)
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
    /* eslint-disable-next-line react-hooks/exhaustive-deps */
  }, [page, pageSize]);

  const submit = async (event: FormEvent): Promise<void> => {
    event.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await api.createDrone({ serialNumber, model });
      setSerialNumber('');
      /* Newest drones sort first, so show the operator the page it landed on. */
      if (page === 1) {
        await load(1);
      } else {
        setPage(1);
      }
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section>
      <header className="masthead">
        <h2>Drone registry</h2>
        <p className="stamp">Register airframes and inspect their service record</p>
      </header>

      <div className="block">
        <header className="block-head">
          <span className="block-index">01</span>
          <h3>Register a drone</h3>
        </header>
        <form onSubmit={submit}>
          <label className="field">
            <span>Serial number</span>
            <input
              placeholder="SKY-XXXX-XXXX"
              aria-label="serial number"
              value={serialNumber}
              onChange={(e) => setSerialNumber(e.target.value)}
              required
            />
          </label>
          <label className="field">
            <span>Model</span>
            <select
              aria-label="model"
              value={model}
              onChange={(e) => setModel(e.target.value as DroneModel)}
            >
              {DRONE_MODELS.map((m) => (
                <option key={m}>{m}</option>
              ))}
            </select>
          </label>
          <button type="submit" disabled={submitting}>
            Register drone
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
          <h3>Fleet</h3>
          <span className="block-note">{total} airframes</span>
        </header>
        {loading ? (
          <p className="loading">Loading fleet</p>
        ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Serial</th>
                <th>Model</th>
                <th>Status</th>
                <th className="num">Flight hours</th>
              </tr>
            </thead>
            <tbody>
              {drones.map((drone) => (
                <tr key={drone.id}>
                  <td>
                    <Link to={`/drones/${drone.id}`}>{drone.serialNumber}</Link>
                  </td>
                  <td className="quiet">{drone.model}</td>
                  <td>
                    <StatusBadge status={drone.status} />
                    {drone.maintenanceDue && <span className="flag">Service due</span>}
                  </td>
                  <td className="num">{drone.totalFlightHours}</td>
                </tr>
              ))}
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
          label="Drones"
        />
      </div>
    </section>
  );
}
