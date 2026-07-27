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
import { MissionResponse, PaginatedResult } from '@skyops/contracts';
import { CreateMissionUseCase } from '../application/create-mission.use-case';
import { ListMissionsUseCase } from '../application/list-missions.use-case';
import { TransitionMissionUseCase } from '../application/transition-mission.use-case';
import { toMissionResponse } from './mission.presenter';
import { CreateMissionDto } from './dto/create-mission.dto';
import { ListMissionsQueryDto } from './dto/list-missions.query.dto';
import { TransitionMissionDto } from './dto/transition-mission.dto';

@ApiTags('Missions')
@Controller('missions')
export class MissionsController {
  constructor(
    private readonly createMission: CreateMissionUseCase,
    private readonly listMissions: ListMissionsUseCase,
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

  @Get()
  @ApiOperation({
    summary: 'List missions',
    description: 'Paginated; filter by status, drone, and scheduled-start range.',
  })
  @ApiOkResponse({ description: 'A page of missions' })
  async findAll(@Query() query: ListMissionsQueryDto): Promise<PaginatedResult<MissionResponse>> {
    const page = await this.listMissions.execute(query);
    return { ...page, items: page.items.map(toMissionResponse) };
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
