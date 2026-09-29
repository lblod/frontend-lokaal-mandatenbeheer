import moment from 'moment';
import { NULL_DATE } from './constants';

export default function getMinMaxDateBetweenOrgaanAndFractiePeriod(
  orgaanPeriod,
  fractiePeriod
) {
  let maxDate = moment(orgaanPeriod.endDate).isSame(moment(NULL_DATE))
    ? null
    : orgaanPeriod.endDate;
  let minDate = moment(orgaanPeriod.startDate).isSame(moment(NULL_DATE))
    ? null
    : orgaanPeriod.startDate;

  if (fractiePeriod?.endDate) {
    maxDate = maxDate
      ? moment.min(moment(maxDate), moment(fractiePeriod.endDate)).toDate()
      : moment(fractiePeriod.endDate).toDate();
  }

  if (fractiePeriod?.startDate) {
    minDate = minDate
      ? moment.max(moment(minDate), moment(fractiePeriod.startDate)).toDate()
      : moment(fractiePeriod.startDate).toDate();
  }

  return { minDate, maxDate };
}
