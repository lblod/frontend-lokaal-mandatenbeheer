import { NULL_DATE } from '../constants';
import { loadBestuursorgaanPeriodFromContext } from '../form-context/application-context-meta-ttl';

export const isValidMandatarisDate = ([dateLiteral], options) => {
  if (!dateLiteral) {
    return true;
  }

  const date = new Date(dateLiteral.value).getTime();
  const period = loadBestuursorgaanPeriodFromContext(options);

  if (period.endDate.getTime() === NULL_DATE.getTime()) {
    if (period.startDate.getTime() <= date) {
      return true;
    }
    return false;
  }

  return date >= period.startDate.getTime() && date <= period.endDate.getTime();
};
