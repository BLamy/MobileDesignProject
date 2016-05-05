/**
 * Created by brett on 4/30/16.
 */

import {Component, ViewEncapsulation, OnInit, Attribute, ElementRef, Input} from "angular2/core";
import * as d3 from 'd3';

@Component({
    selector: 'line-graph',
    encapsulation: ViewEncapsulation.None,

    styles:[`
        line-graph .line{
          fill: none;
          stroke: white;
        }
        
        line-graph .domain{
          fill: none;
          stroke: white;
        }
        
        line-graph text {
          fill: white;
          font: 10px sans-serif;
          text-anchor: end;
        }
    `],
    template: ``,

})
export class LineGraphComponent implements OnInit {

    // target element or selector to contain the svg
    target:any;

    @Input() cursor: number = 0;

    constructor(elementRef:ElementRef,
                @Attribute('width') width:string,
                @Attribute('height') height:string) {
        this.target = elementRef.nativeElement;
        this.init();
    }

    init() {
        let {target, cursor} = this;

        let n = 543,
            duration = 750,
            now = new Date(Date.now() - duration),
            count = 0,
            scrollData = d3.range(n).map(_ => 0);

        const margin = {top: 6, right: 0, bottom: 20, left: 40},
            width = 1700 - margin.right,
            height = 220 - margin.top - margin.bottom;

        const x = d3.time.scale()
            .domain([now - (n - 2) * duration, now - duration])
            .range([0, width]);

        const y = d3.scale.linear()
            .range([height, 0]);

        const line = d3.svg.line()
            .interpolate("basis")
            .x((d, i) => x(now - (n - 1 - i) * duration) )
            .y((d, i) => y(d));

        const svg = d3.select(target).append("p").append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .style("margin-left", -margin.left + "px")
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        svg.append("defs").append("clipPath")
            .attr("id", "clip")
            .append("rect")
            .attr("width", width)
            .attr("height", height);

        const axis = svg.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + height + ")")
            .call((x as any).axis = d3.svg.axis().scale(x).orient("bottom"));

        const path = svg.append("g")
            .attr("clip-path", "url(#clip)")
            .append("path")
            .datum(scrollData)
            .attr("class", "line");

        let transition = d3.select({} as any).transition()
            .duration(duration)
            .ease("linear");

        d3.select(window)
            .on("scroll", () => ++count);

        let that = this;
        (function tick() {
            transition = transition.each(() => {
                // update the domains
                now = new Date() as any;
                x.domain([now - (n - 2) * duration, now - duration]);
                y.domain([0, d3.max(scrollData)]);

                // push the accumulated count onto the back, and reset the count
                scrollData.push(that.cursor);
                count = 0;

                // redraw the line
                svg.select(".line")
                    .attr("d", line)
                    .attr("transform", null);

                // slide the x-axis left
                axis.call((x as any).axis);

                // slide the line left
                path.transition()
                    .attr("transform", "translate(" + x(now - (n - 1) * duration) + ")");

                // pop the old data point off the front
                scrollData.shift();

            }).transition().each("start", tick);
        })();

    }

    ngOnInit():any {
        return null;
    }

}
