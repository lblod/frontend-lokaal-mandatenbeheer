import moment from 'moment';

export const getBestuursPeriodsOG = (organen) => {
  const periods = organen.map((b) => ({
    startDate: moment(b.bindingStart).format('YYYY-MM-DD'),
    endDate: b.bindingEinde
      ? moment(b.bindingEinde).format('YYYY-MM-DD')
      : null,
  }));
  return periods.sortBy('startDate');
};

export const getBestuursPeriods = (organen) => {
  const periods = organen.map((b) => ({
    bestuursOrgaan: b,
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
  const periods = getBestuursPeriods(organen);

  if (!(startDate || endDate)) {
    const today = moment(new Date()).format('YYYY-MM-DD');

    const currentPeriod = periods.find(
      (p) => p.startDate <= today && (today < p.endDate || !p.endDate)
    );
    const firstfuturePeriod = periods.find((p) => p.startDate > today);
    const firstPreviousPeriod = periods.slice(-1)[0];

    const selectedPeriod =
      currentPeriod || firstfuturePeriod || firstPreviousPeriod;
    return selectedPeriod;
  } else {
    return periods.find((period) => {
      return period.startDate == startDate;
    });
  }
};

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
