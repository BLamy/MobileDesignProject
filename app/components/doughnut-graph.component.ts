/**
 * Created by brett on 5/1/16.
 */
import {
    Component, ViewEncapsulation, ElementRef, OnInit, Input, SimpleChange, OnChanges,
    ViewChild, AfterViewInit
} from "angular2/core";
import * as d3 from 'd3'
import {PieModel} from "../typings/PieModel";

@Component({
    selector: 'doughnut-graph',
    encapsulation: ViewEncapsulation.None,
    styles:[`
        :host-context {
          font-family: "Helvetica Neue", Helvetica, Arial, sans-serif;
          position: relative;
        }
        doughnut-graph svg {
          width: 450px;
          height: 450px;
        }
        
        doughnut-graph p {
          font-weight: bold;
          font-size: 18px;
        }
        
        doughnut-graph path.slice{
            stroke-width:2px;
        }
        
        doughnut-graph polyline{
            opacity: .3;
            stroke: black;
            stroke-width: 2px;
            fill: none;
        }
        
        doughnut-graph .flex {
            display: flex;
        }
        
        doughnut-graph .full {
            width: 100%;
        }
        
        doughnut-graph .box {
            display: inline-block;
            width: 15px;
            height: 15px;
            margin: 0 10px;
            border-radius: 100%;
        }
    `],
    template: `
        <p>{{title}}</p>
        <svg #target></svg>
        <div class="flex">
            <div class="full"></div>
            <div *ngFor="#model of data" class="flex">
                <span class="box" [style.backgroundColor]="model.color"></span><span class="box-name">{{model.label}}</span>
            </div>
            <div class="full"></div>
        </div>
    `
})
export class DoughnutGraphComponent implements AfterViewInit, OnChanges {
    /// The d3 target
    @ViewChild('target') target;

    /// Data property setting this property will update the doughnut graph
    @Input() data: Array<PieModel> = [];

    /// The title of the graph 
    @Input() title: string;

    /// The width of the graph
    @Input() width: number = 450;

    /// The height of the graph
    @Input()  height: number = 450;
    
    /// The root D3 object
    graph: d3.Selection<PieModel>;
    
    /// The radius of the graph
    get radius():number {
        return Math.min(this.width, this.height) / 2;
    }

    /// Returns the name of all graph items
    get domain():Array<string> {
        return this.data.map((item) => item.label);
    }

    /// Returns the colors of all
    get range():Array<string> {
        return this.data.map((item) => item.color);
    }

    // Used to calculate the appropriate color for a given item
    get colorScale(){
        return d3.scale.ordinal().domain(this.domain).range(this.range);
    }

    // Pie graph scallar
    pie: d3.layout.Pie<PieModel> = d3.layout.pie<PieModel>().sort(null).value(d => d.value);
    
    // inner arc
    arc: d3.svg.Arc<d3.svg.arc.Arc> = d3.svg.arc().outerRadius(this.radius * 0.8).innerRadius(this.radius * 0.4);
    
    // outer  arc
    outerArc: d3.svg.Arc<d3.svg.arc.Arc> = d3.svg.arc().innerRadius(this.radius * 0.9).outerRadius(this.radius * 0.9);

    ngAfterViewInit():any {
        const { target, width, height } = this;

        const graph = d3.select(target.nativeElement).append("g");
        graph.append("g").attr("class", "slices");
        graph.append("g").attr("class", "labels");
        graph.append("g").attr("class", "lines");
        graph.attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

        this.graph = graph;
    }

    ngOnChanges(changes: {[propName: string]: SimpleChange}) {
        const { data } = changes;
        if (this.target && data) {
            this.change(data.currentValue);
        }
    }

    change(data) {
        const {graph, pie, colorScale, arc} = this;

        /* ------- PIE SLICES -------*/
        const slice = graph.select(".slices")
            .selectAll("path.slice")
            .data(pie(data), d => d.data.label);

        slice.enter()
            .insert("path")
            .style("fill", d => colorScale(d.data.label) as any)
            .attr("class", "slice");

        slice
            .transition().duration(1000)
            .attrTween("d", function(d) {
                // this = d3 animation;
                this._current = this._current || d;
                const interpolate = d3.interpolate(this._current, d as any);
                this._current = interpolate(0);
                return t => arc(interpolate(t) as any);
            });

        slice.exit().remove();
    };
}