import {Pipe, PipeTransform} from 'angular2/core';
/*
 * Raise the value exponentially
 * Takes an exponent argument that defaults to 1.
 * Usage:
 *   value | statusColor
 * Example:
 *   {{ 'Online' |  statusColor}}
 *   formats to: 1024
 */
@Pipe({name: 'statusIcon'})
export class StatusIconPipe implements PipeTransform {
    transform(value:string) : string {
        var map = {
            online: 'check',
            auto: 'check',
            disconnected: 'fa-web-application:plug',
            idle: 'report-problem',
            down: 'close',
            blocked: 'remove-circle-outline',
            starve: 'device:signal-cellular-connected-no-internet-0-bar',
            faulted: 'report'
        };
        return map[value.toLowerCase()];
    }
}