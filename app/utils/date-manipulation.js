import moment from 'moment';
import { NULL_DATE } from './constants';

export function startOfDay(date) {
  if (date) {
    return moment(date).startOf('day').utc().toDate();
  } else {
    return moment().startOf('day').utc().toDate();
  }
}

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

export function isValidDate(date) {
  return (
    date &&
    date instanceof Date &&
    !isNaN(date) &&
    !moment(date).isSame(moment(NULL_DATE))
  );
}

export function isDateInRange(date, min, max) {
  if (!date) {
    return false;
  }
  if (!min && !max) {
    return true;
  }
  if (!min && max) {
    return moment(date).isSameOrBefore(moment(max), 'day');
  }
  if (!max && min) {
    return moment(date).isSameOrAfter(moment(min), 'day');
  }

  return moment(date).isBetween(moment(min), moment(max), 'day', '[]');
}
