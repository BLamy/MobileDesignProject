/**
 * Created by brett on 5/1/16.
 */
import {Component, ViewEncapsulation, ElementRef, OnInit, Input, SimpleChange, OnChanges} from "angular2/core";
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
          width: 960px;
          height: 500px;
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
    `],
    template: ``
})
export class DoughnutGraphComponent implements OnChanges {

    /// The dom target
    target: any;

    /// The root D3 object
    svg: any;

    /// The width of the graph
    width = 450;

    /// The height of the graph
    height = 450;
    
    @Input()
    data: Array<PieModel> = [];

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


    pie = d3.layout.pie().sort(null).value(d => (d as any).value);
    outerArc = d3.svg.arc().innerRadius(this.radius * 0.9).outerRadius(this.radius * 0.9);
    arc = d3.svg.arc().outerRadius(this.radius * 0.8).innerRadius(this.radius * 0.4);

    constructor(elementRef: ElementRef) {
        this.target = elementRef.nativeElement;
        const { width, height } = this;

        let svg = d3.select(this.target).append("svg").append("g");svg.append("g").attr("class", "slices");
        svg.append("g").attr("class", "labels");
        svg.append("g").attr("class", "lines");
        svg.attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

        this.svg = svg;
    }

    ngOnChanges(changes: {[propName: string]: SimpleChange}) {
        let { data } = changes;
        this.change(data.currentValue);
    }

    change(data) {
        const {svg, pie, colorScale, arc} = this;

        /* ------- PIE SLICES -------*/
        let slice = svg.select(".slices")
            .selectAll("path.slice")
            .data(pie(data), d => d.data.label);

        slice.enter()
            .insert("path")
            .style("fill", d => colorScale(d.data.label) as any)
            .attr("class", "slice");

        slice
            .transition().duration(1000)
            .attrTween("d", function(d) {
                this._current = this._current || d;
                let interpolate = d3.interpolate(this._current, d);
                this._current = interpolate(0);
                return t => arc(interpolate(t) as any);
            });

        slice.exit().remove();
    };
}