import { FleetHealthReport } from '@skyops/contracts';

/* A read model, not a repository: it answers report questions with aggregate queries. */
export interface FleetHealthReadModel {
  report(now: Date): Promise<FleetHealthReport>;
}

export const FLEET_HEALTH_READ_MODEL = Symbol('FleetHealthReadModel');
