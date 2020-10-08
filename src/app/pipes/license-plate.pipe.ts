import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'licensePlate' })
export class LicensePlatePipe implements PipeTransform {
  private sidecodes(): Array<string> {
    // See https://nl.wikipedia.org/wiki/Nederlands_kenteken#Alle_sidecodes
    const sidecodes = [];
    sidecodes[0] = /^[a-zA-Z]{2}[\d]{2}[\d]{2}$/;       //  1: XX-99-99
    sidecodes[1] = /^[\d]{2}[\d]{2}[a-zA-Z]{2}$/;       //  2: 99-99-XX
    sidecodes[2] = /^[\d]{2}[a-zA-Z]{2}[\d]{2}$/;       //  3: 99-XX-99
    sidecodes[3] = /^[a-zA-Z]{2}[\d]{2}[a-zA-Z]{2}$/;   //  4: XX-99-XX
    sidecodes[4] = /^[a-zA-Z]{2}[a-zA-Z]{2}[\d]{2}$/;   //  5: XX-XX-99
    sidecodes[5] = /^[\d]{2}[a-zA-Z]{2}[a-zA-Z]{2}$/;   //  6: 99-XX-XX
    sidecodes[6] = /^[\d]{2}[a-zA-Z]{3}[\d]{1}$/;       //  7: 99-XXX-9
    sidecodes[7] = /^[\d]{1}[a-zA-Z]{3}[\d]{2}$/;       //  8: 9-XXX-99
    sidecodes[8] = /^[a-zA-Z]{2}[\d]{3}[a-zA-Z]{1}$/;   //  9: XX-999-X
    sidecodes[9] = /^[a-zA-Z]{1}[\d]{3}[a-zA-Z]{2}$/;   // 10: X-999-XX
    sidecodes[10] = /^[a-zA-Z]{3}[\d]{2}[a-zA-Z]{1}$/;  // 11: XXX-99-X
    sidecodes[11] = /^[a-zA-Z]{1}[\d]{2}[a-zA-Z]{3}$/;  // 12: X-99-XXX
    sidecodes[12] = /^[\d]{1}[a-zA-Z]{2}[\d]{3}$/;      // 13: 9-XX-999
    sidecodes[13] = /^[\d]{3}[a-zA-Z]{2}[\d]{1}$/;      // 14: 999-XX-9
    return sidecodes;
  }

  transform(value: string): string {
    let licensePlate = value.replace(/-/g, '').toUpperCase();

    if (licensePlate.length === 6) {
      const sidecode = this.sidecodes().findIndex(item => licensePlate.match(item)) + 1;

      if (sidecode) {
        if (sidecode <= 6) {
          licensePlate = `${licensePlate.substr(0, 2)}-${licensePlate.substr(2, 2)}-${licensePlate.substr(4, 2)}`;
        }
        if (sidecode === 7 || sidecode === 9) {
          licensePlate = `${licensePlate.substr(0, 2)}-${licensePlate.substr(2, 3)}-${licensePlate.substr(5, 1)}`;
        }
        if (sidecode === 8 || sidecode === 10) {
          licensePlate = `${licensePlate.substr(0, 1)}-${licensePlate.substr(1, 3)}-${licensePlate.substr(4, 2)}`;
        }
        if (sidecode === 11 || sidecode === 14) {
          licensePlate = `${licensePlate.substr(0, 3)}-${licensePlate.substr(3, 2)}-${licensePlate.substr(5, 1)}`;
        }
        if (sidecode === 12 || sidecode === 13) {
          licensePlate = `${licensePlate.substr(0, 1)}-${licensePlate.substr(1, 2)}-${licensePlate.substr(3, 3)}`;
        }
      }
    }

    return licensePlate;
  }
}
