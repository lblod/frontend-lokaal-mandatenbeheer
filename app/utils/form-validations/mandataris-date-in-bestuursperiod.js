import moment from 'moment';
import { NULL_DATE } from '../constants';
import { loadBestuursorgaanPeriodFromContext } from '../form-context/application-context-meta-ttl';
import { isDateInRange } from 'frontend-lmb/components/date-input';

export const isValidMandatarisDate = ([dateLiteral], options) => {
  if (!dateLiteral) {
    return true;
  }

  const date = new Date(dateLiteral.value);
  const period = loadBestuursorgaanPeriodFromContext(options);
  let maxDate = period.endDate;
  let startDate = period.startDate;

  if (moment(period.endDate).isSame(moment(NULL_DATE))) {
    maxDate = null;
  }
  if (moment(period.startDate).isSame(moment(NULL_DATE))) {
    startDate = null;
  }

  return isDateInRange(date, startDate, maxDate);
};
