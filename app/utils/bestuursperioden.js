import moment from 'moment';

const getBestuursPeriodsExtended = (organen) => {
  const periods = organen.map((b) => ({
    bestuursorgaan: b,
    startDate: moment(b.bindingStart).format('YYYY-MM-DD'),
    endDate: b.bindingEinde
      ? moment(b.bindingEinde).format('YYYY-MM-DD')
      : null,
  }));
  return periods.sortBy('startDate');
};

export const getSelectedBestuursorgaanWithPeriods = (
  organen,
  { startDate, endDate }
) => {
  const periods = getBestuursPeriodsExtended(organen);

  if (!(startDate || endDate)) {
    return getClosestPeriod(periods);
  } else {
    return periods.find((period) => {
      return period.startDate == startDate;
    });
  }
};

export const getCurrentBestuursorgaan = (organen) => {
  const sortedPeriods = getBestuursPeriodsExtended(organen);
  const selectedPeriod = getClosestPeriod(sortedPeriods);
  return selectedPeriod.bestuursorgaan;
};

const getClosestPeriod = (periods) => {
  const today = moment(new Date()).format('YYYY-MM-DD');

  const currentPeriod = periods.find(
    (p) => p.startDate <= today && (today < p.endDate || !p.endDate)
  );
  const firstfuturePeriod = periods.find((p) => p.startDate > today);
  const firstPreviousPeriod = periods.slice(-1)[0];

  return currentPeriod || firstfuturePeriod || firstPreviousPeriod;
};
