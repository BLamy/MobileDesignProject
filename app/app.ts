import 'es6-shim';
import {App, Platform} from 'ionic-angular';
import {StatusBar} from 'ionic-native';
import {OnInit} from "angular2/core";
import {MachineService} from "./services/machine.service";
import {Machine} from "./typings/Machine";
import {AppScaffoldComponent, AppContentComponent, AppSidebarComponent} from "./components/app-scaffold.component";
import {BarGraphComponent} from "./components/bar-graph.component";
import {PercentPipe} from "angular2/common";
import {LineGraphComponent} from "./components/line-graph.component";
import {DoughnutGraphComponent} from "./components/doughnut-graph.component";
import {Status} from "./typings/Status";
import {PieModel} from "./typings/PieModel";
import {Observable} from "rxjs/Observable";

@App({
    providers: [MachineService],
    pipes: [PercentPipe],
    directives: [
        AppScaffoldComponent,
        AppContentComponent,
        AppSidebarComponent,
        BarGraphComponent,
        LineGraphComponent,
        DoughnutGraphComponent
    ],
    styles: [`
        app-sidebar #SidebarHeader {
        position: relative;
        background-color: #212121;
        height: 62px;
        line-height: 62px;
        width: 100%;
        border-bottom: 1px solid black;
        color: white;
        }
        
        app-sidebar #SidebarHeader .avatar {
        background: #3474e1;
        border-radius: 100%;
        border: 1px solid white;
        padding: 10px;
        margin: 0 15px;
        }
        
        #LinegraphWrapper {
        width: 100%;
        height: 30vh;
        min-height: calc(64px * 4);
        position: relative;
        }
        
        line-graph {
        position: absolute;
        bottom: 0;
        right: 0;
        }
            
        #CommentBar {
        height: 5vh;
        width: 100%;
        min-height: 44px;
        }
        
        #DashboardFlex {
        display: flex;
        flex-wrap: wrap; 
        margin: 5px;
        }
        
        .card {
        position: relative;
        overflow: hidden;
        background-color: white;
        border-radius: 2px;
        transition: box-shadow 0.28s cubic-bezier(0.4, 0, 0.2, 1);
        box-shadow: 0 2px 2px 0 rgba(0, 0, 0, 0.14),
                    0 1px 5px 0 rgba(0, 0, 0, 0.12),
                    0 3px 1px -2px rgba(0, 0, 0, 0.2);
        }
        
        .card.small {
        margin: 10px;
        padding: 20px;
        width: calc(100% / 4 - 20px);
        }
        
        .card.medium {
        margin: 10px;
        padding: 20px;
        width: calc(100% / 2 - 20px);
        }
        
        .card.large {33
        margin: 20px;
        padding: 20px;
        width: 100%;
        }
        
        @media (max-width: 1023px) {
        .card.small {
            width: calc(100% / 2 - 20px);
        }
        
        .card.medium {
            width: 100%;
        }
        }
        
        #Menu {
        padding: 15px;
        z-index: 2;
        position: absolute;
        }

        .percent-metric {
        margin: 0;
        font-size: 20px;
        font-weight: 500;
        line-height: 28px;
        text-align: center;
        }
        
        .card.small>.title {
        margin: 0;
        opacity: .71;
        }
        
        ul {
        margin: 0;
        padding: 15px;
        list-style:none;
        }
        
        li {
        color: white;
        margin: 10px;
        padding: 10px;
        }
        
        .Online-border {
        border-left: 2px solid #66BB6A;
        }
        
        .Offline-border {
        border-left: 2px solid #F44336;
        }
        
        .Idle-border {
        border-left: 2px solid #FFC107;
        }
        .Online {
        background-color: #66BB6A;
        }
        
        .Offline {
        background-color: #F44336;
        }
        
        .Idle {
        background-color: #FFC107;
        }
        
        .Online-dark {
        background-color: #388E3C;
        }
        
        .Offline-dark {
        background-color: #D32F2F;
        }
        
        .Idle-dark {
        background-color: #FFA000;
        }
        
        .center-text {
        text-align:center
        }

  `],
    template: `
    <app-scaffold>
        <app-sidebar>
            <div id="SidebarHeader">
                <span class="avatar">BL</span><span class="username">Brett Lamy</span>
            </div>
            <ul>
                <li *ngFor="#machine of machines" (click)="changeActiveMachine(machine)" class="{{machine.status}}-border">
                    {{machine.name}}
                </li>
            </ul>
        </app-sidebar>
        <app-content [class.open]="isSidebarOpen">
            <div id="LinegraphWrapper" [class]="statusName$ | async">
                <i id="Menu" class="material-icons" (click)="toggleSidebar($event)">menu</i>
                <line-graph [cursor]="oee$ | async"></line-graph>
            </div>
            <div id="CommentBar" class="{{statusName$ | async}}-dark"></div>
            <div id="DashboardFlex">
            
                <div class="card small"><p class="title">Availability:</p><p class="percent-metric">{{availability$ | async | percent:'1.0-0'}}</p></div>
                <div class="card small"><p class="title">Quality:</p><p class="percent-metric">{{quality$ | async | percent:'1.0-0'}}</p></div>
                <div class="card small"><p class="title">Performance:</p><p class="percent-metric">{{performance$ | async | percent:'1.0-0'}}</p></div>
                <div class="card small"><p class="title">OEE:</p><p class="percent-metric">{{oee$ | async | percent:'1.0-0'}}</p></div>
                
                <div class="card medium center-text"><doughnut-graph title="Status Breakdown" [data]="doughnutGraphData$ | async"></doughnut-graph></div>
                <div class="card medium center-text"><bar-graph></bar-graph></div>
                
            </div>
        </app-content>
    <app-scaffold>
  `,

    config: {} // http://ionicframework.com/docs/v2/api/config/Config/
})
export class MyApp implements OnInit {

    /// Setting this variable will toggle the sidebar on mobile/tablets.
    isSidebarOpen:boolean = false;

    /// The currently active machine
    activeMachine:Machine;

    /// All the machines
    machines:Array<Machine> = [];
    
    /// Contains a stream of all possible events.
    changeStream = this.machineService.changes();
    
    /// Contains a stream of all status changes 
    statusStream:Observable<Status> = this.changeStream
                                          .filter(item => item.hasOwnProperty('status'))
                                          .map(item => item.status)
                                          .startWith(Status.Idle);
    
    /// A stream of the current status's name                               
    statusName$:Observable<string> = this.statusStream
                                         .map(item => Status[item]);

    /// A stream of goodparts
    goodPartStream:Observable<number> = this.changeStream
                                            .filter(item => item.hasOwnProperty('goodPart'))
                                            .map(item => item.goodPart)
                                            .startWith(1);
    
    /// A stream of cycles
    cycleStream:Observable<number> = this.changeStream
                                         .filter(item => item.hasOwnProperty('cycle'))
                                         .map(item => item.cycle)
                                         .startWith(1);
;

    
    /// A stream of rejected parts
    rejectPartStream:Observable<number> = this.changeStream
                                              .filter(item => item.hasOwnProperty('rejectPart'))
                                              .map(item => item.rejectPart)
                                              .startWith(1);
;

      
    //  Will output a stream of data for updating the piegraph. 
    // TODO: make this a little less ugly   
    // TODO: Split into status Acc & doughnutGraph color map
    doughnutGraphData$:Observable<Array<PieModel>> =  Observable
                                                        .combineLatest(this.statusStream, Observable.interval(1000))
                                                        .map(item => item[0])
                                                        .scan((prev:Array<PieModel>, curr) => {
                                                            let index = prev.findIndex(item => (item.label === Status[curr]));
                                                            let pieModel:PieModel = prev[index];
                                                            return [
                                                                ...prev.slice(0, index),
                                                                Object.assign({}, pieModel, {value: pieModel.value+1}),
                                                                ...prev.slice(index+1)
                                                            ];
                                                        }, [
                                                            {
                                                                label: "Online",
                                                                value: 1,
                                                                color: "#4CAF50"
                                                            },
                                                            {
                                                                label: "Offline",
                                                                value: 1,
                                                                color: "#F44336"
                                                            },
                                                            {
                                                                label: "Idle",
                                                                value: 1,
                                                                color: "#FFC107"
                                                            }
                                                        ]);
                     
   
   
   
    // Calculations taken from: http://www.oee.com/calculating-oee.html
    /// Will Tick the aviability as it changes.  
    availability$:Observable<number> = this.doughnutGraphData$.map((item) => {
        const plannedProductionTime = item.reduce((prev, curr) => prev + curr.value, 0);
        const runtime = item.find(item => item.label === "Online").value;
        return runtime / plannedProductionTime;
    });
    
    /// Will Tick the performance as it changes.  
    performance$:Observable<number> = Observable
                                    .combineLatest(this.cycleStream, this.doughnutGraphData$)
                                    .map(item => {
                                        const [cycleCount, statusAcc] = item;
                                        const runtime = statusAcc.find(item => item.label === "Online").value;
                                        const idealCycleTime = this.machineService.cycleTime / 1000;
                                        return (idealCycleTime * cycleCount) / runtime; /* the machine should make 600 parts per minute */;
                                    });
    
       /// Will Tick the quality as it changes.  
    quality$:Observable<number> = Observable
                                    .combineLatest(this.goodPartStream, this.cycleStream)
                                    .map(item => {
                                        const [goodPartCount, cycleCount] = item;
                                        return (goodPartCount / cycleCount) || 0
                                    });

    /// Will Tick the oee as it changes.  
    oee$:Observable<number> = Observable
                                    .combineLatest(this.availability$, this.performance$, this.quality$)
                                    .map(item => {
                                        const [aviability, performance, quality] = item;
                                        return aviability * performance * quality || 0
                                    });



    constructor(platform:Platform, public machineService:MachineService) {
        platform.ready().then(() => {
            StatusBar.styleDefault();
        });
    }

    ngOnInit():any {
        const that = this;

        this.machineService.getMachines().then(machines => {
            this.machines = machines;
            this.activeMachine = machines[0];
            return machines[0];

        })
    }

    toggleSidebar() {
        this.isSidebarOpen = !this.isSidebarOpen;
    }

    changeActiveMachine(machine) {
        this.activeMachine = machine;
    }
}
