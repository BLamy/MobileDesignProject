export class Fault {        
    constructor(public startTime:Date, public endTime?:Date) { }
    
    // number of seconds the machine was down.
    get duration():number {
        if (this.endTime) {
            return this.endTime.getTime() - this.startTime.getTime();
        } else {
            return new Date().getTime() - this.startTime.getTime();
        }
    }
}
