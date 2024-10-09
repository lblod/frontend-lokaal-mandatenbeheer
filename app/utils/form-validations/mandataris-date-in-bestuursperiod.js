import moment from 'moment';
import { NULL_DATE } from '../constants';
import { loadBestuursorgaanPeriodFromContext } from '../form-context/application-context-meta-ttl';

export const isValidMandatarisDate = ([dateLiteral], options) => {
  if (!dateLiteral) {
    return true;
  }

  const date = new Date(dateLiteral.value);
  const period = loadBestuursorgaanPeriodFromContext(options);

  if (period.endDate.getTime() === NULL_DATE.getTime()) {
    if (moment(date).isSameOrAfter(period.startDate)) {
      return true;
    }
    return false;
  }

  return moment(date).isBetween(
    moment(period.startDate),
    moment(period.endDate),
    'day',
    '[]'
  );
};
