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
            <div id="LinegraphWrapper" [class]="activeMachine.statusName$ | async">
                <i id="Menu" class="material-icons" (click)="toggleSidebar($event)">menu</i>
                <line-graph [cursor]="activeMachine.oee$ | async"></line-graph>
            </div>
            <div id="CommentBar" class="{{activeMachine.statusName$ | async}}-dark"></div>
            <div id="DashboardFlex">
            
                <div class="card small"><p class="title">Availability:</p><p class="percent-metric">{{activeMachine.availability$ | async | percent:'1.0-0'}}</p></div>
                <div class="card small"><p class="title">Quality:</p><p class="percent-metric">{{activeMachine.quality$ | async | percent:'1.0-0'}}</p></div>
                <div class="card small"><p class="title">Performance:</p><p class="percent-metric">{{activeMachine.performance$ | async | percent:'1.0-0'}}</p></div>
                <div class="card small"><p class="title">OEE:</p><p class="percent-metric">{{activeMachine.oee$ | async | percent:'1.0-0'}}</p></div>
                
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

    /// All the machines
    machines:Array<Machine> = [];
    
    /// Contains a stream of all possible events.
    changeStream = this.machineService.changes();

    activeMachine: Machine = new Machine(this.machineService.cycleTime, this.changeStream);
    
    doughnutGraphData$:Observable<Array<PieModel>> = this.activeMachine.accumulatedStatusTime$.map(breakdown => {
        return breakdown.reduce((prev, curr) => {
            return prev.concat({
                label: Status[curr.status],
                value: curr.time,
                color: curr.color
            });
        }, [] as Array<PieModel>);
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
        })
    }

    toggleSidebar() {
        this.isSidebarOpen = !this.isSidebarOpen;
    }

    changeActiveMachine(machine) {
        this.activeMachine = machine;
    }
}
