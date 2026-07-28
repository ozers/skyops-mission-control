import { FleetHealthReport } from '@skyops/contracts';
import { FleetHealthReadModel } from './ports/fleet-health.read-model';
import { GetFleetHealthReportUseCase } from './get-fleet-health-report.use-case';

describe('GetFleetHealthReportUseCase', () => {
  it('asks the read model for a report at the current time', async () => {
    const now = new Date('2026-07-01T12:00:00Z');
    const report = { totalDrones: 3 } as FleetHealthReport;
    const readModel: jest.Mocked<FleetHealthReadModel> = {
      report: jest.fn().mockResolvedValue(report),
    };

    const result = await new GetFleetHealthReportUseCase(readModel, { now: () => now }).execute();

    expect(result).toBe(report);
    expect(readModel.report).toHaveBeenCalledWith(now);
  });
});
