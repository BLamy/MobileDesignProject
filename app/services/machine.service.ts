/**
 * Created by brett on 4/24/16.
 */


import {MACHINES} from './mock-machines';
import {Injectable} from 'angular2/core';

@Injectable()
export class MachineService {
    getMachines():Promise<any> {
        return Promise.resolve(MACHINES);
    }
}