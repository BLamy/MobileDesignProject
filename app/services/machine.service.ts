/**
 * Created by brett on 4/24/16.
 */


import {MACHINES} from './mock-machines';
import {Injectable, OnInit} from 'angular2/core';
import {Observable} from "rxjs/Observable";
import {BehaviorSubject} from "rxjs/Rx";
import {Status} from "../model/Status";

@Injectable()
export class MachineService {
    // statusStream:Observable< = Observable.interval(1000 * 30);

    machineStream:BehaviorSubject<any> = new BehaviorSubject('');
    status: Status = Status.Idle;
    
    public cycleTime: number = 100;
    constructor(){
        this.machineStream = new BehaviorSubject('');
        this.generateStatusData();
        this.generateCycleData();
        this.generateFaults();
    }
    
    private generateStatusData() {
        setInterval(function(){
            let randomNumber = Math.random() * 100;
            if (this.status === Status.Offline && randomNumber < 50) {
               this.status = Status.Offline;
            } else if (randomNumber < 90) {
               this.status = Status.Online;
            } else {
               this.status = Status.Idle;
            }
            this.machineStream.next({status:this.status});
        }.bind(this), 1000 * 10);
        this.machineStream.next({status:this.status});
    }
    
    private generateCycleData() {
        // Cycle interval
        let cycleCount = 0;
        let goodPartCount = 0;
        let rejectPartCount = 0;
        const idealRunRate = .90;
        setInterval(function(){
            if (this.status !== Status.Online) return;
            
            this.machineStream.next({ cycle: ++cycleCount });
            const isGoodPart = Math.random() < idealRunRate; // 9 in 10 chance of a good part
            const payload = isGoodPart ? {goodPart: ++goodPartCount} : {rejectPart: ++rejectPartCount};
            this.machineStream.next(payload);
        }.bind(this), this.cycleTime);
    }
    
    private generateFaults() {                
        // Fault interval
        let faultCount = 0;
        const randomFault = () => {
            this.machineStream.next({ fault: ++faultCount });
            this.status = Status.Offline;
            this.machineStream.next({status:this.status});
            setTimeout(randomFault, Math.random() * 45 * 1000)
        };
        
        setTimeout(randomFault, Math.random() * 45 * 1000)
    }

    getMachines():Promise<any> {
        return Promise.resolve(MACHINES);
    }

    changes():BehaviorSubject<any> {
        return this.machineStream;
    }
}