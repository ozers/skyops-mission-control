import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsNumber, IsOptional, IsString, MinLength } from 'class-validator';
import { MISSION_STATUSES, MissionStatus } from '@skyops/contracts';

export class TransitionMissionDto {
  @ApiProperty({ enum: MISSION_STATUSES, description: 'Target state' })
  @IsIn(MISSION_STATUSES)
  to!: MissionStatus;

  @ApiPropertyOptional({ description: 'Required when completing a mission' })
  @IsNumber()
  @IsOptional()
  flightHoursLogged?: number;

  @ApiPropertyOptional({ description: 'Required when aborting a mission' })
  @IsString()
  @MinLength(1)
  @IsOptional()
  abortReason?: string;
}
