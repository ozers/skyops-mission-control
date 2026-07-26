export interface MaintenanceStatusInput {
  lastMaintenanceAt: Date;
  flightHoursSinceMaintenance: number;
  now: Date;
}

/*
 * Maintenance is due every 50 flight hours OR every 90 days, whichever comes
 * first. The date trigger is a concrete next-due date; the hours trigger is
 * checked as flight hours accrue (e.g. when a mission completes).
 */
export const MaintenancePolicy = {
  HOURS_INTERVAL: 50,
  DAYS_INTERVAL: 90,

  nextDueDate(lastMaintenanceAt: Date): Date {
    const due = new Date(lastMaintenanceAt);
    due.setUTCDate(due.getUTCDate() + MaintenancePolicy.DAYS_INTERVAL);
    return due;
  },

  isDue({ lastMaintenanceAt, flightHoursSinceMaintenance, now }: MaintenanceStatusInput): boolean {
    const dueByHours = flightHoursSinceMaintenance >= MaintenancePolicy.HOURS_INTERVAL;
    const dueByTime = now.getTime() >= MaintenancePolicy.nextDueDate(lastMaintenanceAt).getTime();
    return dueByHours || dueByTime;
  },
};
