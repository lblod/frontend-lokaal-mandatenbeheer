import moment from 'moment';
import { NULL_DATE } from '../constants';
import { loadBestuursorgaanPeriodFromContext } from '../form-context/application-context-meta-ttl';

export const isValidMandatarisDate = ([dateLiteral], options) => {
  if (!dateLiteral) {
    return true;
  }

  const date = new Date(dateLiteral.value);
  const period = loadBestuursorgaanPeriodFromContext(options);

  if (moment(period.endDate).isSame(NULL_DATE)) {
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
