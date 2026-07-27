import { Body, Controller, Post } from '@nestjs/common';
import { ApiCreatedResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { MissionResponse } from '@skyops/contracts';
import { CreateMissionUseCase } from '../application/create-mission.use-case';
import { toMissionResponse } from './mission.presenter';
import { CreateMissionDto } from './dto/create-mission.dto';

@ApiTags('Missions')
@Controller('missions')
export class MissionsController {
  constructor(private readonly createMission: CreateMissionUseCase) {}

  @Post()
  @ApiOperation({
    summary: 'Schedule a mission',
    description: 'Rejects windows in the past, unavailable drones, and overlapping missions.',
  })
  @ApiCreatedResponse({ description: 'The scheduled mission' })
  async create(@Body() dto: CreateMissionDto): Promise<MissionResponse> {
    return toMissionResponse(await this.createMission.execute(dto));
  }
}
