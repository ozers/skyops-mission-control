import { DroneModel, DroneStatus } from '@skyops/contracts';
import { MaintenancePolicy } from '../../maintenance/domain/maintenance.policy';
import { SerialNumber } from './serial-number';
import { DroneAlreadyRetiredError, DroneUnavailableError } from './drone.errors';

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
      /* A fresh drone is due for maintenance 90 days from registration (ADR-2 / the brief). */
      nextMaintenanceDueAt: MaintenancePolicy.nextDueDate(input.registeredAt),
    });
  }

  retire(): void {
    if (this.props.status === 'RETIRED') {
      throw new DroneAlreadyRetiredError(this.props.id);
    }
    this.props.status = 'RETIRED';
  }

  assignToMission(): void {
    if (this.props.status !== 'AVAILABLE') {
      throw new DroneUnavailableError(this.props.id, this.props.status);
    }
    this.props.status = 'IN_MISSION';
  }

  /* Mission completed: bank the flight hours and free the drone. */
  logCompletedMission(hours: number): void {
    this.props.totalFlightHours += hours;
    this.props.status = 'AVAILABLE';
  }

  returnFromMission(): void {
    this.props.status = 'AVAILABLE';
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
