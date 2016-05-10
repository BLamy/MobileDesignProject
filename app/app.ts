import 'es6-shim';
import {App, Platform} from 'ionic-angular';
import {StatusBar} from 'ionic-native';
import {OnInit} from "angular2/core";
import {MachineService} from "./services/machine.service";
import {Machine} from "./model/Machine";
import {AppScaffoldComponent, AppContentComponent, AppSidebarComponent} from "./components/app-scaffold.component";
import {BarGraphComponent} from "./components/bar-graph.component";
import {PercentPipe} from "angular2/common";
import {LineGraphComponent} from "./components/line-graph.component";
import {DoughnutGraphComponent} from "./components/doughnut-graph.component";
import {Status} from "./model/Status";
import {PieModel} from "./model/PieModel";
import {Fault} from "./model/Fault";
import {MachineStream} from "./model/MachineStream";
import {Observable} from "rxjs/Observable";
import {BehaviorSubject} from 'rxjs';
import {AnalyticsDashboardComponent} from "./components/analytics-dashboard.component";

@App({
    providers: [MachineService],
    pipes: [PercentPipe],
    directives: [
        AppScaffoldComponent,
        AppContentComponent,
        AppSidebarComponent,
        AnalyticsDashboardComponent
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
        
        
        #Menu {
            padding: 15px;
            z-index: 2;
            position: absolute;
            color: white;
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
        @media (max-width: 567px) {
            .card.medium {
                height: 400px;
            }
        }
   `],
    template: `
    <app-scaffold>
        <app-sidebar>
            <div id="SidebarHeader">
                <span class="avatar">BL</span><span class="username">Brett Lamy</span>
            </div>
            <ul>
                <li *ngFor="#machine of machines" (click)="changeActiveMachine(machine)" class="{{machine.statusName$ | async}}-border">
                    {{machine.name}}
                </li>
            </ul>
        </app-sidebar>
        <app-content [class.open]="isSidebarOpen">
            <analytics-dashboard (toggleMenu)="toggleSidebar()" [machine]="activeMachine"></analytics-dashboard>
        </app-content>
    <app-scaffold>
  `,

    config: {} // http://ionicframework.com/docs/v2/api/config/Config/
})
export class MyApp {

    /// Setting this variable will toggle the sidebar on mobile/tablets. Sidebar is always open on desktop.
    isSidebarOpen:boolean = false;
    
    // All the machines
    machines: Array<Machine> = this.machineService.getMachines([
        "Machine 1",
        "machine 2",
        "Machine 3"
    ]);

    /// THe currently active machine
    activeMachine: Machine = this.machines[0];
                                                          
    constructor(platform:Platform, public machineService:MachineService) {
        platform.ready().then(() => {
            // StatusBar.styleLightContent();
            StatusBar.hide();
        });
    }

    toggleSidebar() {
        this.isSidebarOpen = !this.isSidebarOpen;
    }

    changeActiveMachine(machine: Machine) {
        this.isSidebarOpen = false;

        this.activeMachine = machine;

        // TODO: Implement Multiple machines
        // this.activeMachine = machine;
    }
}
