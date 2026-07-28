import { buildFleetHealthReport } from './fleet-health.calculator';

describe('buildFleetHealthReport', () => {
  it('returns zeros, not nulls, for an empty fleet', () => {
    const report = buildFleetHealthReport({
      statusCounts: [],
      overdueDroneIds: [],
      missionsNext24h: 0,
      averageFlightHours: null,
    });

    expect(report.totalDrones).toBe(0);
    expect(report.averageFlightHours).toBe(0);
    expect(report.overdueMaintenanceDroneIds).toEqual([]);
    expect(report.dronesByStatus).toEqual({
      AVAILABLE: 0,
      IN_MISSION: 0,
      MAINTENANCE: 0,
      RETIRED: 0,
    });
  });

  it('always reports every status key, even when a status has no drones', () => {
    const report = buildFleetHealthReport({
      statusCounts: [
        { status: 'AVAILABLE', count: 3 },
        { status: 'MAINTENANCE', count: 1 },
      ],
      overdueDroneIds: ['d1'],
      missionsNext24h: 2,
      averageFlightHours: 12.5,
    });

    expect(report.totalDrones).toBe(4);
    expect(report.dronesByStatus.IN_MISSION).toBe(0);
    expect(report.dronesByStatus.RETIRED).toBe(0);
    expect(report.dronesByStatus.AVAILABLE).toBe(3);
    expect(report.averageFlightHours).toBe(12.5);
    expect(report.missionsNext24h).toBe(2);
  });

  it('counts a fully retired fleet as zero readiness but non-zero total', () => {
    const report = buildFleetHealthReport({
      statusCounts: [{ status: 'RETIRED', count: 5 }],
      overdueDroneIds: [],
      missionsNext24h: 0,
      averageFlightHours: 40,
    });

    expect(report.totalDrones).toBe(5);
    expect(report.dronesByStatus.AVAILABLE).toBe(0);
    expect(report.dronesByStatus.RETIRED).toBe(5);
  });
});
