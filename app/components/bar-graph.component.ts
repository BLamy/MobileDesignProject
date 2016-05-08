import {Component, AfterViewInit, OnChanges, ElementRef, Attribute, Input, ViewEncapsulation, ViewChild, SimpleChange} from 'angular2/core';
import {Fault} from '../typings/Fault'
import * as d3 from 'd3';
import * as _ from 'lodash';

import scale = d3.time.scale;


@Component({
    selector: 'bar-graph',
    encapsulation: ViewEncapsulation.None,

    styles: [`
        :host-context {
            width: 400px;
            height: 350px;
        }
        
        bar-graph .bar {
            fill: steelblue;
        }

        bar-graph .bar:hover {
            fill: brown;
        }

        bar-graph .axis {
            font: 10px sans-serif;
        }

        bar-graph .axis path,
        bar-graph .axis line {
            fill: none;
            stroke: #000;
            shape-rendering: crispEdges;
        }

        bar-graph .x.axis path {
            display: none;
        }
    `],
    template: `
        <p>{{title}}</p>
        <svg #target></svg>
    `
    
})
export class BarGraphComponent implements AfterViewInit, OnChanges {
    /// The d3 target
    @ViewChild('target') target;


    @Input() data = [];

    svg;
    x;
    y;
    height;
    width;
    xAxis;
    yAxis;
    ngAfterViewInit():any {
        // Mike Bostock "margin conventions"
        var margin = {top: 20, right: 20, bottom: 30, left: 40},
            width = 500 - margin.left - margin.right,
            height = 500 - margin.top - margin.bottom;
        this.width = width;
        this.height = height;
        // D3 scales = just math
        // x is a function that transforms from "domain" (data) into "range" (usual pixels)
        // domain gets set after the data loads
        this.x = d3.scale.ordinal().rangeRoundBands([0, width], .1);
        this.y = d3.scale.linear().range([height, 0]);

        // D3 Axis - renders a d3 scale in SVG
        this.xAxis = d3.svg.axis().scale(this.x).orient("bottom");
        this.yAxis = d3.svg.axis().scale(this.y).orient("left").ticks(10);

        // create an SVG element (appended to body)
        // set size
        // add a "g" element (think "group")
        // annoying d3 gotcha - the 'svg' variable here is a 'g' element
        // the final line sets the transform on <g>, not on <svg>
        const svg = d3.select(this.target.nativeElement)
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        svg.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + height + ")")

        svg.append("g")
            .attr("class", "y axis")
            .append("text") // just for the title (ticks are automatic)
            .attr("transform", "rotate(-90)") // rotate the text!
            .attr("y", 6)
            .attr("dy", ".71em")
            .style("text-anchor", "end")
            .text("Seconds");
            
        this.svg = svg;
    }

    ngOnChanges(changes: {[propName: string]: SimpleChange}) {
        const { data } = changes;
        if (this.target && data) {
            this.change(data.currentValue);
        }
    }
    
    change(data) {
        const {x, y, svg, height, xAxis, yAxis} = this;
        // measure the domain (for x, unique letters) (for y [0,maxFrequency])
        // now the scales are finished and usable
        this.x.domain(data.map(function(d) { return d.letter; }));
        this.y.domain([0, d3.max(data, function(d) { return d.frequency; })]);

        // another g element, this time to move the origin to the bottom of the svg element
        // someSelection.call(thing) is roughly equivalent to thing(someSelection[i])
        //   for everything in the selection\
        // the end result is g populated with text and lines!
        svg.select('.x.axis').transition().duration(300).call(xAxis);

        // same for yAxis but with more transform and a title
        svg.select(".y.axis").transition().duration(300).call(yAxis)

        // THIS IS THE ACTUAL WORK!
        var bars = svg.selectAll(".bar").data(data, function(d) { return d.letter; }) // (data) is an array/iterable thing, second argument is an ID generator function

        bars.exit()
            .transition()
            .duration(300)
            .attr("y", y(0))
            .attr("height", height - y(0))
            .style('fill-opacity', 1e-6)
            .remove();

        // data that needs DOM = enter() (a set/selection, not an event!)
        bars.enter().append("rect")
            .attr("class", "bar")
            .attr("y", y(0))
            .attr("height", height - y(0));

        // the "UPDATE" set:
        bars.transition().duration(300).attr("x", function(d) { return x(d.letter); }) // (d) is one item from the data array, x is the scale object from above
            .attr("width", x.rangeBand()) // constant, so no callback function(d) here
            .attr("y", function(d) { return y(d.frequency); })
            .attr("height", function(d) { return height - y(d.frequency); }); // flip the height, because y's domain is bottom up, but SVG renders top down
    }
}

