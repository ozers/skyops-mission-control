import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsString, Matches } from 'class-validator';
import { DRONE_MODELS, DroneModel } from '@skyops/contracts';

export class RegisterDroneDto {
  @ApiProperty({ example: 'SKY-1A2B-3C4D', description: 'Unique serial, format SKY-XXXX-XXXX' })
  @IsString()
  @Matches(/^SKY-[A-Za-z0-9]{4}-[A-Za-z0-9]{4}$/i, {
    message: 'serialNumber must match SKY-XXXX-XXXX (alphanumeric)',
  })
  serialNumber!: string;

  @ApiProperty({ enum: DRONE_MODELS, example: 'PHANTOM_4' })
  @IsIn(DRONE_MODELS)
  model!: DroneModel;
}
