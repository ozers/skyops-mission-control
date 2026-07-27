import { MissionStatus, MissionType } from '@skyops/contracts';
import { TimeWindow } from './time-window';

export interface MissionProps {
  id: string;
  name: string;
  type: MissionType;
  droneId: string;
  pilotName: string;
  siteLocation: string;
  status: MissionStatus;
  window: TimeWindow;
  actualStart: Date | null;
  actualEnd: Date | null;
  loggedFlightHours: number | null;
  abortReason: string | null;
}

export class Mission {
  private constructor(private readonly props: MissionProps) {}

  static schedule(input: {
    id: string;
    name: string;
    type: MissionType;
    droneId: string;
    pilotName: string;
    siteLocation: string;
    window: TimeWindow;
  }): Mission {
    return new Mission({
      ...input,
      status: 'PLANNED',
      actualStart: null,
      actualEnd: null,
      loggedFlightHours: null,
      abortReason: null,
    });
  }

  static fromPersistence(props: MissionProps): Mission {
    return new Mission(props);
  }

  get id(): string {
    return this.props.id;
  }
  get name(): string {
    return this.props.name;
  }
  get type(): MissionType {
    return this.props.type;
  }
  get droneId(): string {
    return this.props.droneId;
  }
  get pilotName(): string {
    return this.props.pilotName;
  }
  get siteLocation(): string {
    return this.props.siteLocation;
  }
  get status(): MissionStatus {
    return this.props.status;
  }
  get scheduledStart(): Date {
    return this.props.window.start;
  }
  get scheduledEnd(): Date {
    return this.props.window.end;
  }
  get actualStart(): Date | null {
    return this.props.actualStart;
  }
  get actualEnd(): Date | null {
    return this.props.actualEnd;
  }
  get loggedFlightHours(): number | null {
    return this.props.loggedFlightHours;
  }
  get abortReason(): string | null {
    return this.props.abortReason;
  }
}
