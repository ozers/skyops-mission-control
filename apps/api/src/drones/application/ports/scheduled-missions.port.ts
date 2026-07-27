/*
 * Lets the drones module ask whether a drone has active missions, without
 * depending on the missions module's domain. Implemented in infrastructure.
 */
export interface ScheduledMissionsPort {
  activeMissionIdsForDrone(droneId: string): Promise<string[]>;
}

export const SCHEDULED_MISSIONS = Symbol('ScheduledMissionsPort');
