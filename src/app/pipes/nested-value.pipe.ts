import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'nestedValue'
})
export class NestedValuePipe implements PipeTransform {
  /* eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types, @typescript-eslint/no-explicit-any */
  transform(obj: any, ...args: any[]): any {
    return args.reduce((obj, level) => obj && obj[level], obj);
  }
}
