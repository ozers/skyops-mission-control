import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDate, IsIn, IsNumber, IsOptional, IsString, Min, MinLength } from 'class-validator';
import { MAINTENANCE_TYPES, MaintenanceType } from '@skyops/contracts';

export class CreateMaintenanceLogDto {
  @ApiProperty({ enum: MAINTENANCE_TYPES })
  @IsIn(MAINTENANCE_TYPES)
  type!: MaintenanceType;

  @ApiProperty({ example: 'Sam Fox' })
  @IsString()
  @MinLength(1)
  technicianName!: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  notes?: string;

  @ApiProperty({ example: '2026-07-01T09:00:00Z' })
  @Type(() => Date)
  @IsDate()
  performedAt!: Date;

  @ApiProperty({ example: 42 })
  @IsNumber()
  @Min(0)
  flightHoursAtMaintenance!: number;
}
