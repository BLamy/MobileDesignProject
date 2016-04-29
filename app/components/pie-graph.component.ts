/**
 * Created by brett on 4/24/16.
 */
import {Component, OnInit, ElementRef, Attribute, Input, ViewEncapsulation} from 'angular2/core';
import * as d3 from 'd3';
import * as _ from 'lodash';

import scale = d3.time.scale;
import {PieModel} from "../typings/PieModel";


@Component({
    selector: 'pie-graph',
    encapsulation: ViewEncapsulation.None,
    styles: [`
        pie-graph .arc text {
          font: 10px sans-serif;
          text-anchor: middle;
        }
        
        pie-graph .arc path {
          stroke: #fff;
        }
    `],
    template: ``,
})
export class PieGraphComponent implements OnInit {
    @Input() data:Array<PieModel> = [
        {"label":"Online", "value":20},
        {"label":"Offline", "value":50},
        {"label":"Faulted", "value":30}
    ];

    // target element or selector to contain the svg
    target:any;

    // The domain of the chart
    domain:number = 50;

    // width of chart
    width:number = 400;

    // height of chart
    height:number = 400;

    // Radius of the chart
    radius:number = this.height/2;

    constructor(elementRef:ElementRef,
                @Attribute('width') width:string,
                @Attribute('height') height:string) {
        this.target = elementRef.nativeElement;
        this.init();
    }

    init() {
        const {target, data, width, height, radius} = this;

        var colors = ['red', 'green', 'blue'];

        var vis = d3.select(target)
                .append("svg:svg")
                .data([data])
                .attr("width", width)
                .attr("height", height)
                .append("svg:g")
                .attr("transform", `translate(${radius}, ${radius})`);

        var pie = d3.layout.pie().value(d => (d as any).value);

        var arc = d3.svg.arc().outerRadius(radius);

        var arcs = vis.selectAll("g.slice").data(pie).enter().append("svg:g").attr("class", "slice");

        arcs.append("svg:path")
            .attr("fill", (d, i) => colors[i])
            .attr("d", d => arc(d as any));

        arcs.append("svg:text").attr("transform", d => {
            (d as any).innerRadius = 0;
            (d as any).outerRadius = radius;
            return `translate(${arc.centroid(d as any)})`;
        }).attr("text-anchor", "middle")
        .text((d, i) => data[i].label);
    }

    ngOnInit():any {
        return null;
    }
}

