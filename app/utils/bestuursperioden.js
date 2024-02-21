import moment from 'moment';

export const getCurrentBestuursorgaan = (organen) => {
  const periods = organen.map((b) => ({
    bestuursorgaan: b,
    startDate: moment(b.bindingStart).format('YYYY-MM-DD'),
    endDate: b.bindingEinde
      ? moment(b.bindingEinde).format('YYYY-MM-DD')
      : null,
  }));

  const sortedPeriods = periods.sortBy('startDate');

  const today = moment(new Date()).format('YYYY-MM-DD');

  const currentPeriod = sortedPeriods.find(
    (p) => p.startDate <= today && (today < p.endDate || !p.endDate)
  );
  const firstfuturePeriod = sortedPeriods.find((p) => p.startDate > today);
  const firstPreviousPeriod = sortedPeriods.slice(-1)[0];

  const selectedPeriod =
    currentPeriod || firstfuturePeriod || firstPreviousPeriod;
  return selectedPeriod.bestuursorgaan;
};
