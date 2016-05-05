/**
 * Created by brett on 4/24/16.
 */


import {MACHINES} from './mock-machines';
import {Injectable, OnInit} from 'angular2/core';
import {Observable} from "rxjs/Observable";
import {BehaviorSubject} from "rxjs/Rx";
import {Status} from "../typings/Status";

@Injectable()
export class MachineService {
    // statusStream:Observable< = Observable.interval(1000 * 30);

    machineStream:BehaviorSubject<any> = new BehaviorSubject('');x


    constructor(){
        this.machineStream = new BehaviorSubject('');

        // Observable.interval(1000 * 10).startWith({status: Status.Offline}).map(x =>  Math.floor(Math.random() * 3) + 1 as Status);
        // status interval
        setInterval(function(){
            let status:Status = Math.floor(Math.random() * 3) + 1 as Status;
            this.machineStream.next({status});
        }.bind(this), 1000 * 10);
        this.machineStream.next({status: Status.Idle});

        // Cycle interval
        let cycleCount = 0;
        let goodPartCount = 0;
        let rejectPartCount = 0;
        setInterval(function(){
            this.machineStream.next({ cycleCount });
            let isGoodPart = Math.floor(Math.random() * 10) < 9; // 9 in 10 chance of a good part
            let payload = isGoodPart ? {goodPartCount} : {rejectPartCount};
            this.machineStream.next(payload);
        }.bind(this), 100);
    }

    getMachines():Promise<any> {
        return Promise.resolve(MACHINES);
    }


    // statusStream():BehaviorSubject<Status> {
    //
    // }
    changes():BehaviorSubject<any> {
        return this.machineStream;
    }
}