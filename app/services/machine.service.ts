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


    constructor(){
        this.machineStream = new BehaviorSubject('');

        // status interval
        setInterval(function(){
            let status:Status = Math.floor(Math.random() * 3) + 1 as Status;
            this.machineStream.next(status);
        }.bind(this), 1000 * 30);
    }

    getMachines():Promise<any> {
        return Promise.resolve(MACHINES);3
    }


    // statusStream():BehaviorSubject<Status> {
    //
    // }
    getAsyncMachineData():BehaviorSubject<any> {
        return this.machineStream;
    }
}