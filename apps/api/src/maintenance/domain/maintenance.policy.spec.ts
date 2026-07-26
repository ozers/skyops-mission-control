import { MaintenancePolicy } from './maintenance.policy';

describe('MaintenancePolicy', () => {
  const lastMaintenanceAt = new Date('2026-01-01T00:00:00Z');

  describe('nextDueDate', () => {
    it('is 90 days after the last maintenance', () => {
      expect(MaintenancePolicy.nextDueDate(lastMaintenanceAt)).toEqual(
        new Date('2026-04-01T00:00:00Z'),
      );
    });
  });

  describe('isDue', () => {
    const base = { lastMaintenanceAt, flightHoursSinceMaintenance: 0 };

    it('is not due within 90 days and under 50 flight hours', () => {
      const now = new Date('2026-02-15T00:00:00Z');
      expect(MaintenancePolicy.isDue({ ...base, now })).toBe(false);
    });

    it('is due once 90 days have elapsed (time trigger)', () => {
      const now = new Date('2026-04-01T00:00:00Z');
      expect(MaintenancePolicy.isDue({ ...base, now })).toBe(true);
    });

    it('is due once 50 flight hours have accrued (hours trigger)', () => {
      const now = new Date('2026-01-02T00:00:00Z');
      expect(
        MaintenancePolicy.isDue({ ...base, flightHoursSinceMaintenance: 50, now }),
      ).toBe(true);
    });

    it('is not due just under 50 flight hours (boundary)', () => {
      const now = new Date('2026-01-02T00:00:00Z');
      expect(
        MaintenancePolicy.isDue({ ...base, flightHoursSinceMaintenance: 49.9, now }),
      ).toBe(false);
    });
  });
});
