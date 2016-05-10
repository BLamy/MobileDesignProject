import {Status} from './Status';

export interface MachineStream {
    cycle?: number;
    fault?: number;
    goodPart?: number;
    rejectPart?: number;
    status?: Status;
}
