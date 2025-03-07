import moment from 'moment';

export function endOfDay(date) {
  if (date) {
    return moment(date)
      .add(1, 'days')
      .startOf('day')
      .subtract(1, 'seconds')
      .utc()
      .toDate();
  } else {
    return moment()
      .add(1, 'days')
      .startOf('day')
      .subtract(1, 'seconds')
      .utc()
      .toDate();
  }
}
