import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDate, IsIn, IsString, IsUUID, MinLength } from 'class-validator';
import { MISSION_TYPES, MissionType } from '@skyops/contracts';

export class CreateMissionDto {
  @ApiProperty({ example: 'Turbine A inspection' })
  @IsString()
  @MinLength(1)
  name!: string;

  @ApiProperty({ enum: MISSION_TYPES })
  @IsIn(MISSION_TYPES)
  type!: MissionType;

  @ApiProperty({ format: 'uuid' })
  @IsUUID()
  droneId!: string;

  @ApiProperty({ example: 'Jane Doe' })
  @IsString()
  @MinLength(1)
  pilotName!: string;

  @ApiProperty({ example: 'Wind farm North-3' })
  @IsString()
  @MinLength(1)
  siteLocation!: string;

  @ApiProperty({ example: '2026-05-01T10:00:00Z' })
  @Type(() => Date)
  @IsDate()
  scheduledStart!: Date;

  @ApiProperty({ example: '2026-05-01T12:00:00Z' })
  @Type(() => Date)
  @IsDate()
  scheduledEnd!: Date;
}
