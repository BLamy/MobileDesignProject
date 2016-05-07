import {Status} from "../typings/Status";
import {StatusBreakdown} from "../typings/StatusBreakdown";
import {Observable} from 'rxjs'
export interface MachineStream {
    cycle?: number;
    fault?: number;
    goodPart?: number;
    rejectPart?: number;
    status?: Status;
}

const initialStatusData:Array<StatusBreakdown> = [{
        status: Status.Online,
        time: 1,
        color: "#4CAF50"
    },
    {
        status: Status.Offline,
        time: 1,
        color: "#F44336"
    },
    {
        status: Status.Idle,
        time: 1,
        color: "#FFC107"
    }];
export class Machine {
    /// A stream of cycles
    cycleCount$: Observable<number>;

    /// A stream of faults
    faultCount$: Observable<number>;

    /// A stream of good parts
    goodPartCount$: Observable<number>;

    /// A stream of good parts
    rejectPartCount$: Observable<number>;

    /// Contains a stream of all status changes 
    status$: Observable<Status>;

    /// A stream of the current status's name                               
    statusName$: Observable<string>;

    /// A stream of accumulated time (in seconds) spent in each status
    accumulatedStatusTime$: Observable<Array<StatusBreakdown>>;

    /// Will Tick the aviability as it changes.  
    availability$: Observable<number>;

    /// Will Tick the performance as it changes.  
    performance$: Observable<number>;

    /// Will Tick the quality as it changes.  
    quality$: Observable<number>;

    /// Will Tick the oee as it changes.  
    oee$: Observable<number>;

    /**
     *
     */
    constructor(public name: string, stream: Observable<MachineStream>, idealCycleTime: number) {
        //---------------------------------
        // Part streams
        this.cycleCount$ = stream.filter(item => 'cycle' in item).pluck('cycle').startWith(1);
        
        this.faultCount$ = stream.filter(item => 'fault' in item).pluck('fault').startWith(1);
        
        this.goodPartCount$ = stream.filter(item => 'goodPart' in item).pluck('goodPart').startWith(1);
        
        this.rejectPartCount$ = stream.filter(item => 'rejectPart' in  item).pluck('rejectPart').startWith(1);

        //---------------------------------
        // Status 
        this.status$ = stream.filter(item => 'status' in item).pluck('status').startWith(Status.Idle);
        
        this.statusName$ = this.status$.map(item => Status[item]);
        
        this.accumulatedStatusTime$ = Observable
            .combineLatest(this.status$, Observable.interval(1000))
            .map(item => item[0])
            .scan((prev: Array<StatusBreakdown>, curr) => {
                let index = prev.findIndex(item => (item.status === curr));
                let status: StatusBreakdown = prev[index];
                return [
                    ...prev.slice(0, index),
                    Object.assign({}, status, { time: status.time + 1 }),
                    ...prev.slice(index + 1)
                ];
            }, initialStatusData);

        //---------------------------------
        // Computed Properties
        // Calculations taken from: http://www.oee.com/calculating-oee.html
        this.availability$ = this.accumulatedStatusTime$.map((item) => {
            const plannedProductionTime = item.reduce((prev, curr) => prev + curr.time, 0);
            const runtime = item.find(item => item.status === Status.Online).time;
            return runtime / plannedProductionTime || 0;
        });

        this.performance$ = Observable
            .combineLatest(this.cycleCount$, this.accumulatedStatusTime$)
            .map(item => {
                const [cycleCount, statusAcc] = item;
                const runtime = statusAcc.find(item => item.status === Status.Online).time;
                return (idealCycleTime * cycleCount) / runtime || 0;
            });

        this.quality$ = Observable
            .combineLatest(this.goodPartCount$, this.cycleCount$)
            .map(item => {
                const [goodPartCount, cycleCount] = item;
                return (goodPartCount / cycleCount) || 0;
            });

        this.oee$ = Observable
            .combineLatest(this.availability$, this.performance$, this.quality$)
            .map(item => {
                const [aviability, performance, quality] = item;
                return aviability * performance * quality || 0;
            });
    }
}