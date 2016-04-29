import 'es6-shim';
import {App, Platform} from 'ionic-angular';
import {StatusBar} from 'ionic-native';
import {OnInit} from "angular2/core";
import {MachineService} from "./services/machine.service";
import {Machine} from "./typings/Machine";
import {AppScaffoldComponent, AppContentComponent, AppSidebarComponent} from "./components/app-scaffold.component";
import {BarGraphComponent} from "./components/bar-graph.component";
import {PieGraphComponent} from "./components/pie-graph.component";
import {PercentPipe} from "angular2/common";

@App({
  providers: [MachineService],
  pipes: [PercentPipe],
  directives: [AppScaffoldComponent, AppContentComponent, AppSidebarComponent, BarGraphComponent, PieGraphComponent],
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
      background-color: #66BB6A;
    }
        
    #CommentBar {
      height: 5vh;
      width: 100%;
      min-height: 44px;
      background-color: #43A047;
      border-top: 1px solid #66BB6A; 
    }
    
    #DashboardFlex {
      display: flex;
      flex-wrap: wrap; 
    }
    
    .card {
      background-color: white;
      border-radius: 2px;
      transition: box-shadow 0.28s cubic-bezier(0.4, 0, 0.2, 1);
      box-shadow: 0 2px 2px 0 rgba(0, 0, 0, 0.14),
                  0 1px 5px 0 rgba(0, 0, 0, 0.12),
                  0 3px 1px -2px rgba(0, 0, 0, 0.2);
    }
    
    
    .card.small {
      margin: 20px;
      padding: 20px;
      width: calc(100% / 4 - 40px);
     }
    
    .card.medium {
      margin: 20px;
      padding: 20px;
      width: calc(100% / 2 - 40px);
    }
    
    .card.large {
      margin: 20px;
      padding: 20px;
      width: 100%;
    }

  `],
  template: `
    <app-scaffold>
        <app-sidebar>
            <div id="SidebarHeader">
                <span class="avatar">BL</span><span class="username">Brett Lamy</span>
            </div>
            <ul>
                <li *ngFor="#machine of machines" (click)="changeActiveMachine(machine)">{{machine.name}}</li>
            </ul>
        </app-sidebar>
        <app-content [class.open]="isSidebarOpen">
            <div id="LinegraphWrapper">
                <button (click)="toggleSidebar($event)"></button>
            </div>
            <div id="CommentBar"></div>
            <div id="DashboardFlex">
                <div class="card small">Availability: {{activeMachine?.availability | percent}}</div>
                <div class="card small">Quality: {{activeMachine?.quality | percent}}</div>
                <div class="card small">Performance: {{activeMachine?.performance | percent}}</div>
                <div class="card small">OEE: {{activeMachine?.oee | percent}}</div>
                <div class="card medium"><pie-graph></pie-graph></div>
                <div class="card medium"><bar-graph></bar-graph></div>
            </div>
        </app-content>
    <app-scaffold>
  `,

  config: {} // http://ionicframework.com/docs/v2/api/config/Config/
})
export class MyApp implements OnInit {

  /// Setting this variable will toggle the sidebar on mobile/tablets.
  isSidebarOpen: boolean = false;

  /// The currently active machine
  activeMachine: Machine;

  /// All the machines
  machines: Array<Machine> = [];

  constructor(platform: Platform, public machineService: MachineService) {
    platform.ready().then(() => {
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      StatusBar.styleDefault();
    });
  }

  ngOnInit():any {
    this.machineService.getMachines().then(machines => {
      this.machines = machines;
      this.activeMachine = machines[0];
    });
  }

  toggleSidebar(e) {
    this.isSidebarOpen = !this.isSidebarOpen;
  }

  changeActiveMachine(machine) {
    this.activeMachine = machine;
  }
}
