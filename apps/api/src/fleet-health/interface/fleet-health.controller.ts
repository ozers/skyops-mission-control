import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { FleetHealthReport } from '@skyops/contracts';
import { GetFleetHealthReportUseCase } from '../application/get-fleet-health-report.use-case';

@ApiTags('Fleet Health')
@Controller('fleet')
export class FleetHealthController {
  constructor(private readonly getReport: GetFleetHealthReportUseCase) {}

  @Get('health')
  @ApiOperation({
    summary: 'Fleet health report',
    description:
      'Total drones and breakdown by status, drones overdue for maintenance, missions in the ' +
      'next 24 hours, and average flight hours per drone.',
  })
  @ApiOkResponse({ description: 'The fleet health summary' })
  report(): Promise<FleetHealthReport> {
    return this.getReport.execute();
  }
}
