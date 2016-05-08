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
    `],
    template: `
        <p>{{title}}</p>
        <svg #target></svg>
    `
    
})
export class BarGraphComponent implements AfterViewInit, OnChanges {
    /// The d3 target
    @ViewChild('target') target;

    w = 300;
    h = 250;
    @Input() dataset = [ 
                { key: 0, value: 5 },		//dataset is now an array of objects.
                { key: 1, value: 10 },		//Each object has a 'key' and a 'value'.
                { key: 2, value: 13 },
                { key: 3, value: 19 },
                { key: 4, value: 21 },
           ];


	xScale = d3.scale.ordinal().domain(d3.range(this.dataset.length) as any).rangeRoundBands([0, this.w], 0.05);
    yScale = d3.scale.linear().domain([0, d3.max(this.dataset, d => d.value)]).range([0, this.h]);
	key = d => d.key;
    svg;
    ngAfterViewInit():any {
        const { target, w, h, dataset, key, xScale, yScale} = this;
        const svg = d3.select(target.nativeElement)
						.attr("width", w).attr("height", h);
                        
        //Create bars
        svg.selectAll("rect")
            .data(dataset, key)
            .enter()
            .append("rect")
            .attr("x", (d, i) => xScale(i as any))
            .attr("y", d => h - yScale(d.value))
            .attr("width", xScale.rangeBand())
            .attr("height", d => yScale(d.value))
            .attr("fill", d => "rgb(0, 0, " + (d.value * 10) + ")");
            
         svg.selectAll("text")
            .data(dataset, key)
            .enter()
            .append("text")
            .text(d => d.value)
            .attr("text-anchor", "middle")
            .attr("x", (d, i) => xScale(i as any) + xScale.rangeBand() / 2)
            .attr("y", d =>  h - yScale(d.value) + 14)
            .attr("font-family", "sans-serif")
            .attr("font-size", "11px")
            .attr("fill", "white");
            
        this.svg = svg;
    }

    ngOnChanges(changes: {[propName: string]: SimpleChange}) {
        const { dataset } = changes;
        if (this.target && dataset) {
            this.change(dataset.currentValue);
        }
    }
    
    change(dataset) {
        const {svg, xScale, yScale, key, w, h} = this;
        xScale.domain(d3.range(dataset.length) as any);
        yScale.domain([0, d3.max(dataset, d =>  d.value)]);
        var bars = svg.selectAll("rect").data(dataset, key);
        
        //Enter…
        bars.enter()
            .append("rect")
            .attr("x", w)
            .attr("y", d=> h - yScale(d.value))
            .attr("width", xScale.rangeBand())
            .attr("height", d => yScale(d.value))
            .attr("fill", d => "rgb(0, 0, " + (d.value * 10) + ")");
            //Update…
            bars.transition()
                .duration(500)
                .attr("x", (d, i) => xScale(i))
                .attr("y", (d) => h - yScale(d.value))
                .attr("width", xScale.rangeBand())
                .attr("height", (d) => yScale(d.value));

            //Exit…
            bars.exit()
                .transition()
                .duration(500)
                .attr("x", -xScale.rangeBand())
                .remove();
                
                
            //Update all labels

            //Select…
            var labels = svg.selectAll("text").data(dataset, key);
            
            //Enter…
            labels.enter()
                .append("text")
                .text(d => d.value)
                .attr("text-anchor", "middle")
                .attr("x", w)
                .attr("y", d => h - yScale(d.value) + 14)						
                .attr("font-family", "sans-serif")
                .attr("font-size", "11px")
                .attr("fill", "white");

            //Update…
            labels.transition()
                .duration(500)
                .attr("x", function(d, i) {
                    return xScale(i) + xScale.rangeBand() / 2;
                });

            //Exit…
            labels.exit()
                .transition()
                .duration(500)
                .attr("x", -xScale.rangeBand())
                .remove();
    }





    /// Data property setting this property will update the doughnut graph
    // @Input() data: Array<Fault> = [];

    // /// The title of the graph 
    // @Input() title: string;
    
    // outerWidth = 150;
    // outerHeight = 100;
    // margin = { top: 20, right: 30, bottom: 30, left: 40 };
    // x = d3.scale.ordinal().rangeRoundBands([0, this.width], .1);
    // y = d3.scale.linear().range([this.height, 0]);
    // xAxis = d3.svg.axis().scale(this.x).orient("bottom");
    // yAxis = d3.svg.axis().scale(this.y).orient("left").ticks(10, "%");
    
    // // The domain of the chart
    // domain:number = 50;

    // // Width of each bar
    // barWidth:number = 40;
    
    // /// The width of the graph
    // @Input() width: number = this.barWidth * 10;

    // /// The height of the graph
    // @Input()  height: number = 450;
    
    // /// The root D3 object
    // graph: d3.Selection<Fault>;
    
    // ngAfterViewInit():any {
    //     const { target, width, height} = this;
    //     this.graph = d3.select(target.nativeElement)
    //                     .attr("width", outerWidth)
    //                     .attr("height", outerHeight)
    //                     .append("g")
    //                     .attr("transform", "translate(" + this.margin.left + "," + this.margin.top + ")")
    // }

    // ngOnChanges(changes: {[propName: string]: SimpleChange}) {
    //     const { data } = changes;
    //     if (this.target && data) {
    //         this.change(data.currentValue);
    //     }
    // }
    
   
    // change(data) {
    //     this.x.domain(data.map(d => d.startTime));
    //     this.y.domain([0, d3.max(data, d =>  (d as any).duration)]);
 
    //     this.graph
    //         .append("g")
    //         .attr("class", "x axis")
    //         .attr("transform", "translate(0," + this.height + ")") 
    //         .call(this.xAxis);
    
    //     this.graph.select(".y.axis").remove();
    //     this.graph.append("g")
    //         .attr("class", "y axis")
    //         .call(this.yAxis)
    //         .append("text")
    //         .attr("transform", "rotate(-90)")
    //         .attr("y", 6)
    //         .attr("dy", ".21em")
    //         .style("text-anchor", "end")
    //         .text("Frequency");
    
    //     var bar = this.graph.selectAll(".bar").data(data);
    //     // new data:
    //     bar.enter().append("rect")
    //         .attr("class", "bar")
    //         .attr("x", d => this.x((d as any).startTime))
    //         .attr("y",d => this.y((d as any).duration))
    //         .attr("height", d => this.height - this.y((d as any).duration))
    //         .attr("width", 30);
    //     // removed data:
    //     bar.exit().remove();
    //     // updated data:
    //     bar.transition().duration(750)
    //         .attr("y", d => this.y((d as any).duration))
    //         .attr("height", d => this.height - this.y((d as any).duration));
    // };
 




//     change(data) {
//         const {graph, barWidth, height } = this;
        
//         const scaleY = d3.scale.linear().domain([0, d3.max(data)]).range([0, this.height]);
        
//         // const bars = graph.selectAll('g').data(data);
//         var bar = graph.selectAll(".bar")
//             .data(data, d => d as any);

//        bar.enter().append("rect")
//         .attr("class", "bar")
//         .attr("x", function(d) { return x(d.name); })
//         .attr("y", function(d) { return y(d.value); })
//         .attr("height", function(d) { return height - y(d.value); })
//         .attr("width", x.rangeBand());
//     // removed data:
//     bar.exit().remove();
//     // updated data:
//     bar
//         .attr("y", function(d) { return y(d.value); })
//         .attr("height", function(d) { return height - y(d.value); });
//         // "x" and "width" will already be set from when the data was

       
//        chart.select(".y.axis").remove(); // << this line added
// // Existing code to draw y-axis:
// chart.append("g")
//       .attr("class", "y axis")
//       .call(yAxis)
//   .append("text")
//     .attr("transform", "rotate(-90)")
//     .attr("y", 6)
//     .attr("dy", ".71em")
//     .style("text-anchor", "end")
//     .text("Frequency");
    
    
// bar
//   .transition().duration(750)  // <<< added this
//     .attr("y", function(d) { return y(d.value); })
//     .attr("height", function(d) { return height - y(d.value); });
//         console.log(JSON.stringify(data));
//         // const bar = bars
//         //     .enter().append('g')
//         //     .attr('transform', (d, i) => `translate(${i * barWidth}, 0)`);

//         // bar.append('rect')
//         //     .attr('y', d => height - scaleY(d as any))
//         //     .attr('width', barWidth - 1)
//         //     .attr('height', scaleY);

//         // bar.append('text')
//         //     .attr('x', (d, i) => 25)
//         //     .attr('y', height)
//         //     .text(d => {
//         //             return d as any
//         //         });

//         // bar
//         //     .transition().duration(1000)
//         //     .attrTween("d", function(d) {
//         //         // this = d3 animation;
//         //         this._current = this._current || d;
//         //         const interpolate = d3.interpolate(this._current, d as any);
//         //         this._current = interpolate(0);
//         //         return t => interpolate(t);
//         //     });

//         bars.exit().remove();
//     };

}

