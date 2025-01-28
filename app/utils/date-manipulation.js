import moment from 'moment';

export function endOfDay(date) {
  if (date) {
    return moment(date).add(1, 'days').startOf('day').utc().toDate();
  } else {
    return moment().add(1, 'days').startOf('day').utc().toDate();
  }
}

export function displayEndOfDay(date) {
  return moment(date).subtract(1, 'days').toDate();
}
