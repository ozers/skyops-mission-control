import { MissionStatus, MissionType } from '@skyops/contracts';
import { assertCanTransition } from './mission-state-machine';
import {
  MissionAbortReasonRequiredError,
  MissionFlightHoursRequiredError,
} from './mission.errors';
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

  beginPreFlight(): void {
    assertCanTransition(this.props.status, 'PRE_FLIGHT_CHECK');
    this.props.status = 'PRE_FLIGHT_CHECK';
  }

  start(at: Date): void {
    assertCanTransition(this.props.status, 'IN_PROGRESS');
    this.props.status = 'IN_PROGRESS';
    this.props.actualStart = at;
  }

  complete(at: Date, loggedFlightHours: number | undefined): void {
    assertCanTransition(this.props.status, 'COMPLETED');
    if (loggedFlightHours === undefined || loggedFlightHours <= 0) {
      throw new MissionFlightHoursRequiredError();
    }
    this.props.status = 'COMPLETED';
    this.props.actualEnd = at;
    this.props.loggedFlightHours = loggedFlightHours;
  }

  abort(at: Date, reason: string | undefined): void {
    assertCanTransition(this.props.status, 'ABORTED');
    if (!reason || reason.trim() === '') {
      throw new MissionAbortReasonRequiredError();
    }
    this.props.status = 'ABORTED';
    this.props.actualEnd = at;
    this.props.abortReason = reason;
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
