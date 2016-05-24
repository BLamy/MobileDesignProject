import {Status} from "./Status";
import {StatusBreakdown} from "./StatusBreakdown";
import {Observable} from 'rxjs'
import {Fault} from "./Fault";
import {MachineStream} from './MachineStream'
export class Machine {
    /// A stream of cycles
    cycleCount$: Observable<number>;

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

    /// A stream of faults
    faultCount$: Observable<number>;

    /// A stream of accumulated faults
    faultLog$: Observable<Array<Fault>>;
    
    /**
     * A representation of a Machine which exposes it's api as Observables.
     */
    constructor(public name: string, stream: Observable<MachineStream>, idealCycleTime: number) {
        //---------------------------------
        // Part streams
        this.cycleCount$ = stream.filter(item => 'cycle' in item).pluck('cycle').startWith(0);
                
        this.goodPartCount$ = stream.filter(item => 'goodPart' in item).pluck('goodPart').startWith(0);
        
        this.rejectPartCount$ = stream.filter(item => 'rejectPart' in  item).pluck('rejectPart').startWith(0);

        //---------------------------------
        // Status 
        this.status$ = stream.filter(item => 'status' in item).pluck('status').distinctUntilChanged().startWith(Status.Online);
        
        this.statusName$ = this.status$.map(item => Status[item]);

        const initialStatusData:Array<StatusBreakdown> = [
            { status: Status.Online, time: 0, color: "#4CAF50" },
            { status: Status.Offline, time: 0, color: "#F44336" },
            { status: Status.Idle, time: 0, color: "#FFC107" }
        ];

        this.accumulatedStatusTime$ = Observable
            .combineLatest(this.status$, Observable.interval(1000))
            .map(item => item[0])
            .scan((prev: Array<StatusBreakdown>, curr:Status) => {
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
            const runtime = item.find(item => item.status === Status.Online).time;
            const plannedProductionTime = item.reduce((prev, curr) => prev + curr.time, 0);
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
        
        //---------------------------------
        // Faults
        this.faultCount$ = stream.filter(item => 'fault' in item).pluck('fault').startWith(0);

        this.faultLog$ = Observable
            .combineLatest(this.faultCount$, this.status$)
            .scan((acc: { currentFaultCount:number, faults: Array<Fault> } , item: [number, Status]) =>  {
                    const [currentFaultCount, status] = item;
                    const lastFault = acc.faults[0];
                    
                    // Will find any faults without endtimes and set them.
                    const closeFaults = (faults: Array<Fault>) => {
                        return faults.map(item => {
                            if (!item.endTime) {
                                item.endTime = new Date();
                            } 
                            return item;
                        });
                    };
                    
                    /// If the number of faults increases create a new fault in the array.
                    if (currentFaultCount !== acc.currentFaultCount) {
                        return {
                            currentFaultCount,
                            faults: [
                                ...closeFaults(acc.faults),
                                new Fault(new Date())
                            ]
                        }
                    }
                    
                    /// mark the end time if the status changes away from online
                    if (status !== Status.Offline) {
                        return {
                            currentFaultCount,
                            faults: closeFaults(acc.faults)
                        }
                    }
                    
                    return acc;
                }, {currentFaultCount:0, faults:[]})
                .pluck('faults')
    }
}