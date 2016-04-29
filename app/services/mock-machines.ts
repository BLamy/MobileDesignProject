import {Machine} from "../typings/Machine";
import {Status} from "../typings/Status";

export var MACHINES: Machine[]= [
    {
        name: 'Machine 1',
        status: 'Online',
        availability: .97,
        quality: .93,
        performance: .83,
        oee: .75,
        statusBreakdown: [
            {status: Status.Online, time: 100000},
            {status: Status.Offline, time: 100000},
            {status: Status.Idle, time: 100000}
        ]
    },
    {
        name: 'Machine 2',
        status: 'Idle',
        availability: .93,
        quality: .92,
        performance: .81,
        oee: .70,
        statusBreakdown: [
            {status: Status.Online, time: 100000},
            {status: Status.Offline, time: 10000},
            {status: Status.Idle, time: 10000}
        ]
    },
    {
        name: 'Machine 3',
        status: 'Offline',
        availability: .93,
        quality: .92,
        performance: .81,
        oee: .70,
        statusBreakdown: [
            {status: Status.Online, time: 100000},
            {status: Status.Offline, time: 10000},
            {status: Status.Idle, time: 10000}
        ]
    }
];