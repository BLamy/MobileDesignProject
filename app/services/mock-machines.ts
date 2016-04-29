import {Machine} from "../typings/Machine";
import {Status} from "../typings/Status";

export var MACHINES: Machine[]= [
    {
        name: 'machine1',
        availability: .97,
        quality: .93,
        performance: .83,
        oee: .75,
        statusBreakdown: [
            {status: Status.Online, time: 100000},
            {status: Status.Offline, time: 100000},
            {status: Status.Idle, time: 100000}
        ]
    }
];