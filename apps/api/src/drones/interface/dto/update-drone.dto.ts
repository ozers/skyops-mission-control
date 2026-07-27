import { ApiProperty } from '@nestjs/swagger';
import { IsIn } from 'class-validator';
import { DRONE_MODELS, DroneModel } from '@skyops/contracts';

export class UpdateDroneDto {
  @ApiProperty({ enum: DRONE_MODELS })
  @IsIn(DRONE_MODELS)
  model!: DroneModel;
}
