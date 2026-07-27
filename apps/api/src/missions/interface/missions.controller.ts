import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
} from '@nestjs/common';
import { ApiCreatedResponse, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { MissionResponse } from '@skyops/contracts';
import { CreateMissionUseCase } from '../application/create-mission.use-case';
import { TransitionMissionUseCase } from '../application/transition-mission.use-case';
import { toMissionResponse } from './mission.presenter';
import { CreateMissionDto } from './dto/create-mission.dto';
import { TransitionMissionDto } from './dto/transition-mission.dto';

@ApiTags('Missions')
@Controller('missions')
export class MissionsController {
  constructor(
    private readonly createMission: CreateMissionUseCase,
    private readonly transitionMission: TransitionMissionUseCase,
  ) {}

  @Post()
  @ApiOperation({
    summary: 'Schedule a mission',
    description: 'Rejects windows in the past, unavailable drones, and overlapping missions.',
  })
  @ApiCreatedResponse({ description: 'The scheduled mission' })
  async create(@Body() dto: CreateMissionDto): Promise<MissionResponse> {
    return toMissionResponse(await this.createMission.execute(dto));
  }

  @Post(':id/transitions')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Transition a mission',
    description:
      'Runs the state machine and applies drone side effects atomically. Completing needs ' +
      'flightHoursLogged; aborting needs abortReason.',
  })
  @ApiOkResponse({ description: 'The updated mission' })
  async transition(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: TransitionMissionDto,
  ): Promise<MissionResponse> {
    return toMissionResponse(await this.transitionMission.execute(id, dto));
  }
}
