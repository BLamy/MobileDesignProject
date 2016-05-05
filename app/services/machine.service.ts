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

    machineStream:BehaviorSubject<any> = new BehaviorSubject('');
    public cycleTime: number = 100;
    constructor(){
        this.machineStream = new BehaviorSubject('');
        
        let status: Status = Status.Idle;
        // status interval
        let faultCount = 0;
        setInterval(function(){
            let randomNumber = Math.random() * 100;
            if (randomNumber < 85) {
               status = Status.Online;
            } else if (randomNumber < 95) {
               status = Status.Offline;
               this.machineStream.next({fault: faultCount++});
            } else {
               status = Status.Idle;
            }
            this.machineStream.next({status});
        }.bind(this), 1000 * 10);
            this.machineStream.next({status});

        // Cycle interval
        let cycleCount = 0;
        let goodPartCount = 0;
        let rejectPartCount = 0;
        const idealRunRate = .90;
        setInterval(function(){
            if (status !== Status.Online) return;
            
            this.machineStream.next({ cycle: cycleCount++ });
            const isGoodPart = Math.random() < idealRunRate; // 9 in 10 chance of a good part
            const payload = isGoodPart ? {goodPart: goodPartCount++} : {rejectPart: rejectPartCount++};
            this.machineStream.next(payload);
        }.bind(this), this.cycleTime);
    }

    getMachines():Promise<any> {
        return Promise.resolve(MACHINES);
    }

    changes():BehaviorSubject<any> {
        return this.machineStream;
    }
}