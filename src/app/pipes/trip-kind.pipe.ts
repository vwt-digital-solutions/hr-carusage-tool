import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'tripKind'
})
export class TripKindPipe implements PipeTransform {
  transform(tripKind: string | null, type: string, value?: string): string | boolean | null {
    if (type === 'string') {
      if (tripKind === 'work') {
        return 'Zakelijk';
      } else if (tripKind === 'personal') {
        return 'Privé';
      }
    } else if (type === 'boolean' && value) {
      return tripKind === value ? true : false;
    }
    return null;
  }
}
