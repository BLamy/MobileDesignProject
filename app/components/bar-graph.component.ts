import {Component, AfterViewInit, OnChanges, ElementRef, Attribute, Input, ViewEncapsulation, ViewChild, SimpleChange} from 'angular2/core';
import {Fault} from '../model/Fault'
import * as d3 from 'd3';
import * as _ from 'lodash';

import scale = d3.time.scale;

export class BarModel {
    letter:string;
    frequency:number;
}

@Component({
    selector: 'bar-graph',
    encapsulation: ViewEncapsulation.None,

    styles: [`
        :host-context {
            width: 400px;
            height: 350px;
        }
        
        bar-graph p {
          text-align: center;
          font-weight: bold;
          font-size: 18px;
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
        
        bar-graph svg {
            position: relative;
            left: 50%;
            transform: translateX(-50%);
            width: 450px;
            height: 450px;
        }
        
        @media (max-width: 567px) {
            bar-graph svg {
                transform: scale(.7) translateX(-70%) translateY(-30%);
            }
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

    /// Data property setting this property will update the bar graph
    @Input() data: Array<BarModel> = [];

    /// The title of the graph 
    @Input() title: string;
    
    /// The root D3 object
    svg: d3.Selection<BarModel>;
    
    ///The margin around the graph
    margin = {top: 20, right: 20, bottom: 30, left: 40};
    
    /// The height of the graph
    height =  500 - this.margin.top - this.margin.bottom;
    
    /// The width of the graph
    width = 500 - this.margin.left - this.margin.right;
    
    x = d3.scale.ordinal().rangeRoundBands([0, this.width], .1);
    y = d3.scale.linear().range([this.height, 0]);
    xAxis = d3.svg.axis().scale(this.x).orient("bottom");
    yAxis = d3.svg.axis().scale(this.y).orient("left").ticks(10);
    
    ngAfterViewInit():any {
        const {margin, height, width} = this;

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
            .append("text")
            .attr("transform", "rotate(-90)")
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
        this.x.domain(data.map(d => d.letter));
        this.y.domain([0, d3.max(data, d => (d as any).frequency)]);
        svg.select('.x.axis').transition().duration(300).call(xAxis);
        svg.select(".y.axis").transition().duration(300).call(yAxis)

        var bars = svg.selectAll(".bar").data(data, d => (d as any).letter)

        bars.exit()
            .transition()
            .duration(300)
            .attr("y", y(0))
            .attr("height", height - y(0))
            .style('fill-opacity', 1e-6)
            .remove();

        bars.enter().append("rect")
            .attr("class", "bar")
            .attr("y", y(0))
            .attr("height", height - y(0));

        bars.transition().duration(300).attr("x", d => x((d as any).letter)) 
            .attr("width", x.rangeBand())
            .attr("y", d => y((d as any).frequency))
            .attr("height", d => height - y((d as any).frequency));
    }
}

