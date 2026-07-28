import type { DroneStatus, MissionStatus } from '@skyops/contracts';

export function StatusBadge({ status }: { status: DroneStatus | MissionStatus }) {
  return <span className={`badge badge-${status}`}>{status}</span>;
}
