import {Component, ContentChild, AfterContentInit} from "angular2/core";

@Component({
    selector: 'app-sidebar',
    styles: [`
        :host-context {
          position: absolute;
          height: 100%;
          background: #303030;
          width: 280px;
        }
      `],
    template: '<ng-content></ng-content>'
})
export class AppSidebarComponent {}

@Component({
    selector: 'app-content',
    styles: [`

        :host-context {
          position: absolute;
          overflow-y: scroll;
          height: 100%;
          width: 100%;
          background: #F2F2F2;
          transition: transform .2s ease-in-out;
          z-index: 2;
        }
        
        :host-context(.open) {
            transform: translateX(280px);
        }
        
        @media screen and (min-width: 1400px) {
            :host-context {
                transform: translateX(280px);
                width: calc(100% - 280px);
            }
        }

    `],
    template: '<ng-content></ng-content>'
})
export class AppContentComponent {}


@Component({
    selector: 'app-scaffold',
    styles:[`
        app-content {
            z-index: 1;
        }
    `],
    template: `
        <div class="wrapper">
            <ng-content select="app-content"></ng-content>
            <ng-content select="app-sidebar"></ng-content>
        </div>
    `
})
export class AppScaffoldComponent implements AfterContentInit {
    @ContentChild(AppSidebarComponent) sidebar: AppSidebarComponent;
    @ContentChild(AppContentComponent) content: AppContentComponent;

    ngAfterContentInit():any {
        return undefined;
    }
}