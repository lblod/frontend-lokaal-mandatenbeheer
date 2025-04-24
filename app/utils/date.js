import moment from 'moment';
import { NULL_DATE } from './constants';

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
    return moment(date).isSameOrBefore(moment(max));
  }
  if (!max && min) {
    return moment(date).isSameOrAfter(moment(min));
  }

  return moment(date).isBetween(moment(min), moment(max), 'day', '[]');
}
