import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDate, IsIn, IsInt, IsOptional, IsUUID, Min } from 'class-validator';
import { MISSION_STATUSES, MissionStatus } from '@skyops/contracts';

export class ListMissionsQueryDto {
  @ApiPropertyOptional({ default: 1, minimum: 1 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  page?: number;

  @ApiPropertyOptional({ default: 20, minimum: 1 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  pageSize?: number;

  @ApiPropertyOptional({ enum: MISSION_STATUSES })
  @IsIn(MISSION_STATUSES)
  @IsOptional()
  status?: MissionStatus;

  @ApiPropertyOptional({ format: 'uuid' })
  @IsUUID()
  @IsOptional()
  droneId?: string;

  @ApiPropertyOptional({ description: 'Scheduled start on or after this time' })
  @Type(() => Date)
  @IsDate()
  @IsOptional()
  from?: Date;

  @ApiPropertyOptional({ description: 'Scheduled start on or before this time' })
  @Type(() => Date)
  @IsDate()
  @IsOptional()
  to?: Date;
}
