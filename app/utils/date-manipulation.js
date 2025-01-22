import moment from 'moment';

export function endOfDay(date) {
  if (date) {
    return moment(date).utc().add(1, 'days').startOf('day').toDate();
  } else {
    return moment().utc().add(1, 'days').startOf('day').toDate();
  }
}

export function displayEndOfDay(date) {
  return moment(date).subtract(1, 'days').toDate();
}
