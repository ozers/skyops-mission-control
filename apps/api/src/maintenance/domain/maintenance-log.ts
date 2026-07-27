import { MaintenanceType } from '@skyops/contracts';

export interface MaintenanceLogProps {
  id: string;
  droneId: string;
  type: MaintenanceType;
  technicianName: string;
  notes: string | null;
  performedAt: Date;
  flightHoursAtMaintenance: number;
}

export class MaintenanceLog {
  private constructor(private readonly props: MaintenanceLogProps) {}

  static record(props: MaintenanceLogProps): MaintenanceLog {
    return new MaintenanceLog(props);
  }

  static fromPersistence(props: MaintenanceLogProps): MaintenanceLog {
    return new MaintenanceLog(props);
  }

  get id(): string {
    return this.props.id;
  }
  get droneId(): string {
    return this.props.droneId;
  }
  get type(): MaintenanceType {
    return this.props.type;
  }
  get technicianName(): string {
    return this.props.technicianName;
  }
  get notes(): string | null {
    return this.props.notes;
  }
  get performedAt(): Date {
    return this.props.performedAt;
  }
  get flightHoursAtMaintenance(): number {
    return this.props.flightHoursAtMaintenance;
  }
}
