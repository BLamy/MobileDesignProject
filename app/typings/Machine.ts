
import {StatusBreakdown} from "./StatusBreakdown";
/**
 * The model every machine must conform to.
 *
 * OEE calculations:
 * http://www.oee.com/calculating-oee.html
 */
export class Machine {
    /// The name of the machine
    name: string;

    /// Availability = Run Time / Planned Production Time
    availability: number;

    /// Quality = Good Count / Total Count
    quality: number;

    /// ['Online', 'Offline', 'Idle'] 
    status: string;

    /// Performance = (Ideal Cycle Time × Total Count) / Run Time
    performance: number;

    // /// OEE = Availability × Performance × Quality
    oee: number;

    /// An overview of exactly
    statusBreakdown: Array<StatusBreakdown>;
}
