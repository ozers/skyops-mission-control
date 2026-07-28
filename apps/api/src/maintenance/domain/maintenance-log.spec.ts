import { MaintenanceLog } from './maintenance-log';

describe('MaintenanceLog', () => {
  const props = {
    id: 'log-1',
    droneId: 'd1',
    type: 'BATTERY_REPLACEMENT' as const,
    technicianName: 'Sam Fox',
    notes: 'Swapped both packs',
    performedAt: new Date('2026-07-01T09:00:00Z'),
    flightHoursAtMaintenance: 42.5,
  };

  it('records the activity as given', () => {
    const log = MaintenanceLog.record(props);

    expect(log.id).toBe('log-1');
    expect(log.droneId).toBe('d1');
    expect(log.type).toBe('BATTERY_REPLACEMENT');
    expect(log.technicianName).toBe('Sam Fox');
    expect(log.notes).toBe('Swapped both packs');
    expect(log.performedAt).toEqual(props.performedAt);
    expect(log.flightHoursAtMaintenance).toBe(42.5);
  });

  it('rebuilds from persistence without notes', () => {
    const log = MaintenanceLog.fromPersistence({ ...props, notes: null });
    expect(log.notes).toBeNull();
  });
});
