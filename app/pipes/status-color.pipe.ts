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
@Pipe({name: 'statusColor'})
export class StatusColorPipe implements PipeTransform {
    transform(value:string) : string {
        var map = {
            "online": '#4CAF4F',
            'auto': '#4CAF4F',
            'disconnected': '#9E9E9E',
            'idle': '#FFC103',
            'down': '#F54236',
            'blocked': '#FF9800',
            'starved': '#795548',
            'faulted': '#FF5721'
        };
        return map[value.toLowerCase()];
    }
}