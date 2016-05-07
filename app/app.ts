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
        min-height: 80px;
        }
        
        .card.medium {
        margin: 10px;
        padding: 20px;
        width: calc(100% / 2 - 20px);
        }
        
        .card.large {
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
            color: white;
        }
        
        p#PageTitle {
            margin: 0;
            padding: 0;
            z-index: 2;
            margin-left: 53px;
            font-size: 20px;
            font-weight: 500;
            line-height: 53px;
            position: absolute;
            color: white;
        }

        .percent-metric {
            position: absolute;
            margin: 0;
            font-size: 20px;
            font-weight: 500;
            line-height: 28px;
            text-align: center;
            top: 40%;
            left: 50%;
            transform: translateX(-50%);
        }
        .card.small>i {
            position: absolute;
            top: 40%;
            opacity: .71;
        }
        
        .card.small>.title {
            margin: 0;
            position: absolute;
            opacity: .71;
            top: 10px;
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
                <li *ngFor="#machine of machines$ | async" (click)="changeActiveMachine(machine)" class="{{machine.status}}-border">
                    {{machine.name}}
                </li>
            </ul>
        </app-sidebar>
        <app-content [class.open]="isSidebarOpen">
            <div id="LinegraphWrapper" [class]="activeMachine.statusName$ | async">
                <i id="Menu" class="material-icons" (click)="toggleSidebar($event)">menu</i>
                <p id="PageTitle">{{ activeMachine.name }}</p>
                <line-graph [cursor]="activeMachine.oee$ | async"></line-graph>
            </div>
            <div id="CommentBar" class="{{activeMachine.statusName$ | async}}-dark"></div>
            <div id="DashboardFlex">
            
                <div class="card small">
                    <i class="material-icons">timer</i>
                    <p class="title">Availability</p>
                    <p class="percent-metric">{{activeMachine.availability$ | async | percent:'1.0-0'}}</p>
                </div>
                <div class="card small">
                    <i class="material-icons">assignment_turned_in</i>
                    <p class="title">Quality</p>
                    <p class="percent-metric">{{activeMachine.quality$ | async | percent:'1.0-0'}}</p>
                </div>
                <div class="card small">
                    <i class="material-icons">trending_up</i>
                    <p class="title">Performance</p>
                    <p class="percent-metric">{{activeMachine.performance$ | async | percent:'1.0-0'}}</p>
                </div>
                <div class="card small">
                    <i class="material-icons">assessment</i>
                    <p class="title">OEE</p>
                    <p class="percent-metric">{{activeMachine.oee$ | async | percent:'1.0-0'}}</p>
                </div>
                
                <div class="card medium center-text">
                    <doughnut-graph title="Status Breakdown" [data]="doughnutGraphData$ | async"></doughnut-graph>
                </div>
                <div class="card medium center-text">
                    <bar-graph></bar-graph>
                </div>
                
            </div>
        </app-content>
    <app-scaffold>
  `,

    config: {} // http://ionicframework.com/docs/v2/api/config/Config/
})
export class MyApp {

    /// Setting this variable will toggle the sidebar on mobile/tablets. Sidebar is always open on desktop.
    isSidebarOpen:boolean = false;

    /// All the machines
    machines$:Promise<Machine> = this.machineService.getMachines();
    
    /// Contains a stream of all possible events.
    changeStream = this.machineService.changes();

    /// THe currently active machine
    activeMachine: Machine = new Machine("Machine 1", this.changeStream, this.machineService.cycleTime/1000);
    
    /// The reduction of data for the DoughnutGraphComponent
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

    toggleSidebar() {
        this.isSidebarOpen = !this.isSidebarOpen;
    }

    changeActiveMachine(machine: Machine) {
        // TODO: Implement Multiple machines
        // this.activeMachine = machine;
    }
}
