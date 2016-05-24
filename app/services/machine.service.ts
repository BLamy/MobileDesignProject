/**
 * Created by brett on 4/24/16.
 */


import {MACHINES} from './mock-machines';
import {Injectable, OnInit} from 'angular2/core';
import {Observable} from "rxjs/Observable";
import {BehaviorSubject} from "rxjs/Rx";
import {Status} from "../model/Status";
import {Machine} from "../model/Machine";
import {MachineStream} from '../model/MachineStream'
@Injectable()
export class MachineService {
    cache: {[propName: string]: Observable<MachineStream>}  = {};
    
    private cycleTime: number = 100;
    
    private generateData(machineStream) {
        let status: Status = Status.Idle;
        const rotateStatuses = () => {
            let randomNumber = Math.random() * 100;
            if (status === Status.Offline && randomNumber < 20) {
               status = Status.Offline;
            } else if (randomNumber < 90) {
               status = Status.Online;
            } else {
               status = Status.Idle;
            }
            machineStream.next({status:status});
            setTimeout(rotateStatuses, 1000 * 10);
        };
        setTimeout(rotateStatuses, 1000 * 5);
    
        // Cycle interval
        let cycleCount = 0;
        let goodPartCount = 0;
        let rejectPartCount = 0;
        const idealRunRate = .90;
        setInterval(() =>{
            if (status !== Status.Online) return;
            
            machineStream.next({ cycle: ++cycleCount });
            const isGoodPart = Math.random() < idealRunRate; // 9 in 10 chance of a good part
            const payload = isGoodPart ? {goodPart: ++goodPartCount} : {rejectPart: ++rejectPartCount};
            machineStream.next(payload);
        }, this.cycleTime);
    
        // Fault interval
        let faultCount = 0;
        const randomFault = () => {
            machineStream.next({ fault: ++faultCount });
            status = Status.Offline;
            machineStream.next({ status });
            setTimeout(randomFault, Math.random() * 45 * 1000)
        };
        
        setTimeout(randomFault, Math.random() * 45 * 1000)
    }
    
    getMachine(machineName:string):Machine {
        if (this.cache[machineName]) {
            return new Machine(machineName, this.cache[machineName], this.cycleTime/1000);
        }

        this.cache[machineName] = new BehaviorSubject<MachineStream>({});
        this.generateData(this.cache[machineName]);
        return new Machine(machineName, this.cache[machineName], this.cycleTime/1000);
    }

    getMachines(machineNames:Array<string>):Array<Machine> {
        return machineNames.map(name => this.getMachine(name));
    }
}