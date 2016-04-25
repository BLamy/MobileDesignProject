import { Component } from 'angular2/core';
import { StatusIconPipe } from '../pipes/status-icon.pipe';
import { StatusColorPipe } from '../pipes/status-color.pipe';

@Component({
    selector: 'machine-sidebar',
    pipes: [StatusIconPipe, StatusColorPipe],
    template: `
        <div id='current_wrapper' class="{{status}} status-background-light">
          <paper-ripple class="{{status}} status-font"></paper-ripple>
          <div id="status-bar" class="{{status}} status-background"></div>
          <div id="title-wrapper">
            <h2 class="{{status}} status-font">
              <iron-icon icon="{{status | statusIcon}}"></iron-icon>
              <span class='name'>{{name}}</span>
            </h2>
            <h3 class='timestamp'>
              <iron-icon icon="query-builder" size='13px'></iron-icon>
              <span>{{status}}</span>&nbsp;<time is="relative-time" datetime="{{timestamp}}">
            </h3>
          </div>
        </div>
    `
})
export class MachineSidebarComponent {


}