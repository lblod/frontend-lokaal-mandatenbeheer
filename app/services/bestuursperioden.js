import Service from '@ember/service';

import { service } from '@ember/service';

export default class BestuursperiodenService extends Service {
  @service store;

  async getRelevantTijdsspecialisaties(bestuursperiode) {
    const tijdsspecialisaties = await bestuursperiode.get(
      'heeftBestuursorganenInTijd'
    );
    const filtered = (
      await Promise.all(
        tijdsspecialisaties.map(async (orgaan) => ({
          value: orgaan,
          valid: await orgaan.containsPoliticalMandates,
        }))
      )
    )
      .filter((v) => v.valid)
      .map((data) => data.value);
    return filtered;
  }

  async getCurrentBestuursperiode() {
    const periods = await this.store.query('bestuursperiode', {
      sort: 'label',
    });
    return this.getClosestPeriod(periods);
  }

  getRelevantPeriod(periods, bestuursperiodeId) {
    if (bestuursperiodeId) {
      return periods.find((period) => {
        return period.id == bestuursperiodeId;
      });
    } else {
      return this.getClosestPeriod(periods);
    }
  }

  getClosestPeriod(periods) {
    const now = new Date().getFullYear() - 1;

    const currentPeriod = periods.find(
      (p) => p.start <= now && (now < p.einde || !p.einde)
    );
    const firstfuturePeriod = periods.find((p) => p.start > now);
    const firstPreviousPeriod = periods[0];

    return currentPeriod || firstfuturePeriod || firstPreviousPeriod;
  }

  isCurrentPeriod(period) {
    if (!period) {
      return false;
    }

    let isCurrent = false;
    const currentYear = new Date().getFullYear();
    if (
      currentYear >= period.start &&
      (!period.einde || currentYear < period.einde)
    ) {
      isCurrent = true;
    }

    return isCurrent;
  }
}
