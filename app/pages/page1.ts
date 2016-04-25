
import {Page} from 'ionic-angular';
import { MachineService } from '../services/machine.service';
import {OnInit} from "angular2/core";
import {BarGraphComponent} from '../components/bar-graph.component'
import {PieGraphComponent} from '../components/pie-graph.component'


@Page({
    providers: [MachineService],
    directives: [BarGraphComponent, PieGraphComponent],
    template: `

<ion-navbar *navbar hideBackButton>

  <button menuToggle>
    <ion-icon name='menu'></ion-icon>
  </button>

  <ion-title>
    Menus
  </ion-title>
    
</ion-navbar>


<ion-content padding>
  <div class="material">
    <bar-graph></bar-graph>
  </div>
  <div class="material">
    <pie-graph></pie-graph>
  </div>
</ion-content>

  `
})
export class Page1 implements OnInit {
    machines: Array<any> = [];

    constructor(public machineService: MachineService) { }

    ngOnInit():any {
        this.machineService.getMachines().then(machines => {
            this.machines = machines;
            console.log(JSON.stringify(this.machines));
        });
    }

    didClick() {
    }
}
