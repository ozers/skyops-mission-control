import { Body, Controller, Get, Param, ParseUUIDPipe, Post, Query } from '@nestjs/common';
import {
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { DroneResponse, PaginatedResult } from '@skyops/contracts';
import { GetDroneUseCase } from '../application/get-drone.use-case';
import { ListDronesUseCase } from '../application/list-drones.use-case';
import { RegisterDroneUseCase } from '../application/register-drone.use-case';
import { toDroneResponse } from './drone.presenter';
import { ListDronesQueryDto } from './dto/list-drones.query.dto';
import { RegisterDroneDto } from './dto/register-drone.dto';

@ApiTags('Drones')
@Controller('drones')
export class DronesController {
  constructor(
    private readonly registerDrone: RegisterDroneUseCase,
    private readonly getDrone: GetDroneUseCase,
    private readonly listDrones: ListDronesUseCase,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Register a drone', description: 'Adds a drone to the fleet registry.' })
  @ApiCreatedResponse({ description: 'The drone was registered' })
  async create(@Body() dto: RegisterDroneDto): Promise<DroneResponse> {
    return toDroneResponse(await this.registerDrone.execute(dto));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a drone by id' })
  @ApiOkResponse({ description: 'The drone' })
  @ApiNotFoundResponse({ description: 'No drone with that id' })
  async findOne(@Param('id', ParseUUIDPipe) id: string): Promise<DroneResponse> {
    return toDroneResponse(await this.getDrone.execute(id));
  }

  @Get()
  @ApiOperation({ summary: 'List drones', description: 'Paginated, optionally filtered by status.' })
  @ApiOkResponse({ description: 'A page of drones' })
  async findAll(@Query() query: ListDronesQueryDto): Promise<PaginatedResult<DroneResponse>> {
    const page = await this.listDrones.execute(query);
    return { ...page, items: page.items.map(toDroneResponse) };
  }
}
