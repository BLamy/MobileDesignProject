
import {MachineService} from '../services/machine.service';
import {OnInit, Component} from "angular2/core";
import {BarGraphComponent} from '../components/bar-graph.component'
import {PieGraphComponent} from '../components/pie-graph.component'
import {PieModel} from "../typings/PieModel";
import {Machine} from "../typings/Machine";
import {Status} from "../typings/Status";
import {MdCheckbox} from '@angular2-material/checkbox/checkbox'

@Component({
    selector: 'page-one',
    providers: [MachineService],
    directives: [BarGraphComponent, PieGraphComponent, MdCheckbox],
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
<md-checkbox></md-checkbox>
  <div class="material">
    <bar-graph></bar-graph>
  </div>
  <div class="material">
    <pie-graph [data]="pieData"></pie-graph>
  </div>
</ion-content>

  `
})
export class Page1 implements OnInit {
    machines: Array<Machine> = [];
    pieData: Array<PieModel> = [];

    constructor(public machineService: MachineService) { }

    ngOnInit():any {
        this.machineService.getMachines().then(machines => {
            this.machines = machines;

            this.pieData = this.machines[0].statusBreakdown.map(status => {
                return {
                    label: Status[status.status],
                    value: status.time
                }
            });

            // console.log(JSON.stringify(this.machines));
        });
    }

    didClick() {
    }
}
