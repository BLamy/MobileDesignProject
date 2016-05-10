import {Component, Input, OnInit, Output, EventEmitter} from 'angular2/core';
import {BarGraphComponent} from "./bar-graph.component";
import {LineGraphComponent} from "./line-graph.component";
import {DoughnutGraphComponent} from "./doughnut-graph.component";
import {Machine} from "../model/Machine";
import {Status} from "../model/Status";
import {PieModel} from "../model/PieModel";
import {Observable} from "rxjs/Observable";

@Component({
    selector: 'analytics-dashboard',
    
    directives: [
        BarGraphComponent,
        LineGraphComponent,
        DoughnutGraphComponent
    ],


    styles:[`
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
    
    template:`
            <div id="LinegraphWrapper" [class]="machine.statusName$ | async">
                <i id="Menu" class="material-icons" (click)="menuClick($event)">menu</i>
                <p id="PageTitle">{{ machine.name }}</p>
                <line-graph [cursor]="machine.oee$ | async"></line-graph>
            </div>
            <div id="CommentBar" class="{{machine.statusName$ | async}}-dark"></div>
            <div id="DashboardFlex">
            
                <div class="card small">
                    <i class="material-icons">timer</i>
                    <p class="title">Availability</p>
                    <p class="percent-metric">{{machine.availability$ | async | percent:'1.0-0'}}</p>
                </div>
                <div class="card small">
                    <i class="material-icons">assignment_turned_in</i>
                    <p class="title">Quality</p>
                    <p class="percent-metric">{{machine.quality$ | async | percent:'1.0-0'}}</p>
                </div>
                <div class="card small">
                    <i class="material-icons">trending_up</i>
                    <p class="title">Performance</p>
                    <p class="percent-metric">{{machine.performance$ | async | percent:'1.0-0'}}</p>
                </div>
                <div class="card small">
                    <i class="material-icons">assessment</i>
                    <p class="title">OEE</p>
                    <p class="percent-metric">{{machine.oee$ | async | percent:'1.0-0'}}</p>
                </div>
                
                <div class="card medium">
                    <doughnut-graph title="Today's Status Breakdown" [data]="doughnutGraphData$ | async"></doughnut-graph>
                </div>
                <div class="card medium">
                    <bar-graph title="Recent Fault Durations" [data]="barGraphData$ | async"></bar-graph>
                </div>
   
            </div>
    `
})
export class AnalyticsDashboardComponent implements OnInit {
    @Input() machine: Machine;

    @Output() toggleMenu = new EventEmitter();

    /// The reduction of data for the DoughnutGraphComponent
    doughnutGraphData$:Observable<Array<PieModel>>;

    barGraphData$;

    ngOnInit():any {
         this.doughnutGraphData$ = this.machine.accumulatedStatusTime$.map(breakdown => {
            return breakdown.reduce((prev, curr) => {
                return prev.concat({
                    label: Status[curr.status],
                    value: curr.time,
                    color: curr.color
                });
            }, [] as Array<PieModel>);
        });

        this.barGraphData$ = Observable
            .combineLatest(this.machine.faultLog$, Observable.interval(1000))
            .map(item => {
                const [faults] = item;
                return faults.slice(-10);
            }).map(faults => {
                return faults.map(fault => {
                    return {
                        letter: fault.startTime.toTimeString().split(' ')[0],// formats to HH:MM:ss
                        frequency: fault.duration / 1000
                    };
                })
            }).startWith([]);
    }

    menuClick():void {
        this.toggleMenu.emit(null);
    }


}