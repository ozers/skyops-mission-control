import { MissionStatus } from '@skyops/contracts';

export class IllegalTransitionError extends Error {
  constructor(
    readonly from: MissionStatus,
    readonly to: MissionStatus,
  ) {
    super(`Illegal mission transition: ${from} -> ${to}`);
    this.name = 'IllegalTransitionError';
  }
}
