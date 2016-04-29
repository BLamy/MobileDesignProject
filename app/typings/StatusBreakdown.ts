import {Status} from "./Status";
/**
 * A status breakdown object represents how much time a system spent in a particular status.
 */
export interface StatusBreakdown {
    /// The status that this status breakdown object represents
    status: Status;

    /// Time in milliseconds that system spend that that given state.
    time: number;
}
