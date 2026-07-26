import { Controller, Get } from '@nestjs/common';
import {
  ApiOkResponse,
  ApiOperation,
  ApiServiceUnavailableResponse,
  ApiTags,
} from '@nestjs/swagger';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  constructor(@InjectDataSource() private readonly dataSource: DataSource) {}

  @Get()
  @ApiOperation({
    summary: 'Liveness probe',
    description:
      'Returns 200 while the process is running. Touches no dependencies, so an ' +
      'orchestrator can use it to decide whether to restart the container.',
  })
  @ApiOkResponse({ description: 'Process is up', schema: { example: { status: 'ok' } } })
  live(): { status: string } {
    return { status: 'ok' };
  }

  @Get('ready')
  @ApiOperation({
    summary: 'Readiness probe',
    description:
      'Verifies downstream dependencies are reachable by issuing `SELECT 1` against ' +
      'PostgreSQL. Use it to gate traffic before the app is ready to serve requests.',
  })
  @ApiOkResponse({
    description: 'Dependencies reachable',
    schema: { example: { status: 'ok', db: 'up' } },
  })
  @ApiServiceUnavailableResponse({ description: 'A dependency (database) is unreachable' })
  async ready(): Promise<{ status: string; db: string }> {
    await this.dataSource.query('SELECT 1');
    return { status: 'ok', db: 'up' };
  }
}
