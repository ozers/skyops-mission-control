import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
} from '@nestjs/common';
import { ApiCreatedResponse, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { DroneResponse, MaintenanceLogResponse, PaginatedResult } from '@skyops/contracts';
import { toDroneResponse } from '../../drones/interface/drone.presenter';
import { CreateMaintenanceLogUseCase } from '../application/create-maintenance-log.use-case';
import { ListMaintenanceLogsUseCase } from '../application/list-maintenance-logs.use-case';
import { StartMaintenanceUseCase } from '../application/start-maintenance.use-case';
import { toMaintenanceLogResponse } from './maintenance-log.presenter';
import { CreateMaintenanceLogDto } from './dto/create-maintenance-log.dto';
import { ListMaintenanceLogsQueryDto } from './dto/list-maintenance-logs.query.dto';

@ApiTags('Maintenance')
@Controller('drones/:droneId')
export class MaintenanceController {
  constructor(
    private readonly startMaintenance: StartMaintenanceUseCase,
    private readonly createMaintenanceLog: CreateMaintenanceLogUseCase,
    private readonly listMaintenanceLogs: ListMaintenanceLogsUseCase,
  ) {}

  @Post('maintenance')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Start maintenance', description: 'Puts an available drone into MAINTENANCE.' })
  @ApiOkResponse({ description: 'The drone, now under maintenance' })
  async start(@Param('droneId', ParseUUIDPipe) droneId: string): Promise<DroneResponse> {
    return toDroneResponse(await this.startMaintenance.execute(droneId));
  }

  @Post('maintenance-logs')
  @ApiOperation({
    summary: 'Log completed maintenance',
    description: 'Records the log, resets the tracking dates, and returns the drone to service.',
  })
  @ApiCreatedResponse({ description: 'The maintenance log' })
  async createLog(
    @Param('droneId', ParseUUIDPipe) droneId: string,
    @Body() dto: CreateMaintenanceLogDto,
  ): Promise<MaintenanceLogResponse> {
    return toMaintenanceLogResponse(await this.createMaintenanceLog.execute(droneId, dto));
  }

  @Get('maintenance-logs')
  @ApiOperation({ summary: 'Maintenance history', description: 'Paginated logs for a drone.' })
  @ApiOkResponse({ description: 'A page of maintenance logs' })
  async listLogs(
    @Param('droneId', ParseUUIDPipe) droneId: string,
    @Query() query: ListMaintenanceLogsQueryDto,
  ): Promise<PaginatedResult<MaintenanceLogResponse>> {
    const page = await this.listMaintenanceLogs.execute({ droneId, ...query });
    return { ...page, items: page.items.map(toMaintenanceLogResponse) };
  }
}
