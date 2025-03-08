import { Pipe, PipeTransform } from '@angular/core';
import { formatDistance } from 'date-fns';
import moment from 'moment';

@Pipe({
  name: 'distance',
})
export class DistancePipe implements PipeTransform {
  public transform(value: unknown): string {
    console.log(value);
    let date = value;
    if (typeof date === 'string' || typeof date === 'number') {
      date = new Date(date);
    }

    if (!(date instanceof Date)) {
      let stringified = `${date}`;

      const toString = date?.['toString'];
      if (toString instanceof Function) {
        stringified = toString();
      }

      if (stringified === '[object Object]') {
        stringified = JSON.stringify(date);
      }

      throw new Error(
        `DatePipe only works with Date, number or string, provided value: ${date}`,
      );
    }

    const now = moment().utc().toDate();
    return formatDistance(now, date);
  }
}
