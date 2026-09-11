import {
  loadBestuursorgaanPeriodFromContext,
  loadFractieStartEndDateFromStore,
} from '../form-context/application-context-meta-ttl';
import { isDateInRange } from '../date-manipulation';
import getMinMaxDateBetweenOrgaanAndFractiePeriod from '../getStartEndDateForFractiePeriod';

export const isValidMandatarisDate = async ([dateLiteral], options) => {
  if (!dateLiteral) {
    return true;
  }

  const date = new Date(dateLiteral.value);
  const period = loadBestuursorgaanPeriodFromContext(options);
  const fractiePeriod = await loadFractieStartEndDateFromStore(options);

  const { minDate, maxDate } = getMinMaxDateBetweenOrgaanAndFractiePeriod(
    period,
    fractiePeriod
  );

  return isDateInRange(date, minDate, maxDate);
};
