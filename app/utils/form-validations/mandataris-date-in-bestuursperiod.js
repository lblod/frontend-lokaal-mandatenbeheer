import moment from 'moment';
import { NULL_DATE } from '../constants';
import {
  loadBestuursorgaanPeriodFromContext,
  loadFractieStartEndDateFromStore,
} from '../form-context/application-context-meta-ttl';
import { isDateInRange } from '../date-manipulation';

export const isValidMandatarisDate = async ([dateLiteral], options) => {
  if (!dateLiteral) {
    return true;
  }

  const date = new Date(dateLiteral.value);
  const period = loadBestuursorgaanPeriodFromContext(options);
  const fractiePeriod = await loadFractieStartEndDateFromStore(options);

  let maxDate = period.endDate;
  let startDate = period.startDate;

  if (moment(period.endDate).isSame(moment(NULL_DATE))) {
    maxDate = null;
  }
  if (moment(period.startDate).isSame(moment(NULL_DATE))) {
    startDate = null;
  }

  if (fractiePeriod?.endDate) {
    maxDate = maxDate
      ? moment.min(moment(maxDate), moment(fractiePeriod.endDate)).toDate()
      : moment(fractiePeriod.endDate).toDate();
  }

  if (fractiePeriod?.startDate) {
    startDate = startDate
      ? moment.max(moment(startDate), moment(fractiePeriod.startDate)).toDate()
      : moment(fractiePeriod.startDate).toDate();
  }

  return isDateInRange(date, startDate, maxDate);
};
