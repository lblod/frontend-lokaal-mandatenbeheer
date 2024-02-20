import Controller from '@ember/controller';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import moment from 'moment';

export default class OrganenBeheerIndexController extends Controller {
  @service router;
  @service store;

  @tracked active_page = 0;
  active_sort = 'naam';
  active_size = 5;

  @tracked inactive_page = 0;
  inactive_sort = 'naam';
  inactive_size = 5;

  @action
  createNewOrgaan() {
    this.router.transitionTo('organen.beheer.new');
  }

  @action
  async getNbMembers(orgaan) {
    const currentOrgaan = await this.getCurrentBestuursorgaanInDeTijd(orgaan);
    const mandaten = await this.getMandatenForOrgaan(currentOrgaan);
    const mandatenAmounts = await Promise.all(
      mandaten.map(async (mandaat) => {
        return (await this.getMandatarissenForMandaat(mandaat)).meta.count;
      })
    );
    const amount = mandatenAmounts.reduce((acc, curr) => acc + curr, 0);
    return amount;
  }

  async getCurrentBestuursorgaanInDeTijd(orgaan) {
    const organen = await this.getRelevantBestuursorganenInDeTijd(orgaan);
    const period = this.calculateCurrentBestuursperiod(organen);
    const currentOrgaan = this.getBestuursorgaanForPeriod(organen, period);
    return currentOrgaan;
  }

  async getRelevantBestuursorganenInDeTijd(orgaan) {
    return await this.store.query('bestuursorgaan', {
      'filter[is-tijdsspecialisatie-van][id]': orgaan.id,
    });
  }

  calculateCurrentBestuursperiod(organen) {
    const periods = organen.map((b) => ({
      startDate: moment(b.bindingStart).format('YYYY-MM-DD'),
      endDate: b.bindingEinde
        ? moment(b.bindingEinde).format('YYYY-MM-DD')
        : null,
    }));

    const comparablePeriods = periods.map((period) => JSON.stringify(period));
    const uniquePeriods = [...new Set(comparablePeriods)].map((period) =>
      JSON.parse(period)
    );
    const sortedPeriods = uniquePeriods.sortBy('startDate');

    const today = moment(new Date()).format('YYYY-MM-DD');

    const currentPeriod = sortedPeriods.find(
      (p) => p.startDate <= today && (today < p.endDate || !p.endDate)
    );
    const firstfuturePeriod = sortedPeriods.find((p) => p.startDate > today);
    const firstPreviousPeriod = sortedPeriods.slice(-1)[0];

    return currentPeriod || firstfuturePeriod || firstPreviousPeriod;
  }

  getBestuursorgaanForPeriod(organen, period) {
    const filteredOrganen = organen.filter((b) => {
      const start = moment(b.bindingStart).format('YYYY-MM-DD');
      const end = b.bindingEinde
        ? moment(b.bindingEinde).format('YYYY-MM-DD')
        : null;
      return start == period.startDate && end == period.endDate;
    });
    return filteredOrganen[0];
  }

  getMandatenForOrgaan(bestuursorgaan) {
    const queryParams = {
      filter: {
        'bevat-in': {
          id: bestuursorgaan.get('id'),
        },
      },
    };
    return this.store.query('mandaat', queryParams);
  }

  getMandatarissenForMandaat(mandaat) {
    const queryParams = {
      filter: {
        bekleedt: {
          id: mandaat.get('id'),
        },
      },
    };
    return this.store.query('mandataris', queryParams);
  }
}
