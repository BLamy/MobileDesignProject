import {Status} from "./Status";
import {StatusColorPipe} from "../pipes/status-color.pipe";

/**
 * A status breakdown object represents how much time a system spent in a particular status.
 */
export class StatusBreakdown {
    /// The status that this status breakdown object represents
    status: Status;

    /// Time in seconds that system spend that that given state.
    time: number;
    
    color: string;
}
