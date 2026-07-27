import { FleetHealthReport } from '@skyops/contracts';
import { Clock } from '../../shared/application/clock';
import { FleetHealthReadModel } from './ports/fleet-health.read-model';

export class GetFleetHealthReportUseCase {
  constructor(
    private readonly readModel: FleetHealthReadModel,
    private readonly clock: Clock,
  ) {}

  execute(): Promise<FleetHealthReport> {
    return this.readModel.report(this.clock.now());
  }
}
