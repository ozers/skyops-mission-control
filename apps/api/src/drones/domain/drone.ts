import { DroneModel, DroneStatus } from '@skyops/contracts';
import { SerialNumber } from './serial-number';

export interface DroneProps {
  id: string;
  serialNumber: SerialNumber;
  model: DroneModel;
  status: DroneStatus;
  totalFlightHours: number;
  lastMaintenanceAt: Date | null;
  nextMaintenanceDueAt: Date | null;
  registeredAt: Date;
}

export class Drone {
  private constructor(private readonly props: DroneProps) {}

  static register(input: {
    id: string;
    serialNumber: SerialNumber;
    model: DroneModel;
    registeredAt: Date;
  }): Drone {
    return new Drone({
      ...input,
      status: 'AVAILABLE',
      totalFlightHours: 0,
      lastMaintenanceAt: null,
      nextMaintenanceDueAt: null,
    });
  }

  /* Rebuild an aggregate from persisted state, bypassing registration rules. */
  static fromPersistence(props: DroneProps): Drone {
    return new Drone(props);
  }

  get id(): string {
    return this.props.id;
  }
  get serialNumber(): SerialNumber {
    return this.props.serialNumber;
  }
  get model(): DroneModel {
    return this.props.model;
  }
  get status(): DroneStatus {
    return this.props.status;
  }
  get totalFlightHours(): number {
    return this.props.totalFlightHours;
  }
  get lastMaintenanceAt(): Date | null {
    return this.props.lastMaintenanceAt;
  }
  get nextMaintenanceDueAt(): Date | null {
    return this.props.nextMaintenanceDueAt;
  }
  get registeredAt(): Date {
    return this.props.registeredAt;
  }
}
