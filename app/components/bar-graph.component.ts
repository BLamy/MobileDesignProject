import {Component, OnInit, ElementRef, Attribute, Input, ViewEncapsulation} from 'angular2/core';
import * as d3 from 'd3';
import * as _ from 'lodash';

import scale = d3.time.scale;

@Component({
    selector: 'bar-graph',
    encapsulation: ViewEncapsulation.None,

    styles: [`
        bar-graph rect {
          fill: steelblue;
        }
        
        bar-graph text {
          fill: white;
          font: 10px sans-serif;
          text-anchor: end;
        }
    `],
    template: ``
    
})
export class BarGraphComponent implements OnInit {
    @Input() data:Array<number> = _.map(_.range(15), i => Math.floor(Math.random() * 50));

    // target element or selector to contain the svg
    target:any;

    // The domain of the chart
    domain:number = 50;

    // Width of each bar
    barWidth:number = 40;

    // width of chart
    width:number = this.barWidth * this.data.length;

    // height of chart
    height:number = 420;



    constructor(elementRef:ElementRef,
                @Attribute('width') width:string,
                @Attribute('height') height:string) {
        this.target = elementRef.nativeElement;
        this.init();
    }

    init() {
        const { target, data, barWidth, width, height} = this;

        const scaleY = d3.scale.linear()
            .domain([0, 50])
            .range([0, height]);

        const chart = d3.select(target).append('svg').attr('width', width).attr('height', height);

        const bar = chart.selectAll('g')
            .data(data)
            .enter().append('g')
            .attr('transform', (d, i) => `translate(${i * barWidth}, 0)`);

        bar.append('rect')
            .attr('y', d => height - scaleY(d))
            .attr('width', barWidth - 1)
            .attr('height', scaleY);

        bar.append('text')
            .attr('x', (d, i) => 25)
            .attr('y', height)
            .text(d => d);
    }

    ngOnInit():any {
        return null;
    }
}

