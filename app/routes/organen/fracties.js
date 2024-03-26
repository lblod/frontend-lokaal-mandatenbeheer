import Route from '@ember/routing/route';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import moment from 'moment';

export default class FractiesRoute extends Route {
  @service store;

  queryParams = {
    filter: { refreshModel: true },
    page: { refreshModel: true },
    size: { refreshModel: true },
    sort: { refreshModel: true },
    startDate: { refreshModel: true },
    endDate: { refreshModel: true },
  };

  async model(params) {
    const parentModel = this.modelFor('organen');
    const bestuurseenheid = parentModel.bestuurseenheid;

    this.startDate = params.startDate;
    this.endDate = params.endDate;

    const bestuursorganen = await this.getRelevantBestuursorganen(
      bestuurseenheid.get('id')
    );
    const bestuursperiods =
      this.calculateUniqueBestuursperiods(bestuursorganen);
    const selectedPeriod = this.calculateSelectedPeriod(bestuursperiods, {
      startDate: this.startDate,
      endDate: this.endDate,
    });

    const selectedBestuursOrganen = this.getBestuursorganenForPeriod(
      bestuursorganen,
      selectedPeriod
    );
    const bestuursorganenIds = selectedBestuursOrganen.map((o) => o.get('id'));

    const fracties = await this.store.query('fractie', {
      sort: params.sort,
      page: {
        number: params.page,
        size: params.size,
      },
      'filter[bestuursorganen-in-tijd][id]': bestuursorganenIds.join(','),
      include: 'bestuursorganen-in-tijd',
    });

    return {
      fracties,
      bestuurseenheid,
      bestuursorganen: selectedBestuursOrganen,
      bestuursperiods,
      selectedPeriod,
    };
  }

  async getRelevantBestuursorganen(bestuurseenheidId) {
    return await this.store.query('bestuursorgaan', {
      'filter[is-tijdsspecialisatie-van][bestuurseenheid][id]':
        bestuurseenheidId,
      'filter[:has:bevat]': true, // only organs with a political mandate
    });
  }

  calculateUniqueBestuursperiods(bestuursorganen) {
    const periods = bestuursorganen.map((b) => ({
      startDate: moment(b.bindingStart).format('YYYY-MM-DD'),
      endDate: b.bindingEinde
        ? moment(b.bindingEinde).format('YYYY-MM-DD')
        : null,
    }));

    const comparablePeriods = periods.map((period) => JSON.stringify(period));
    const uniquePeriods = [...new Set(comparablePeriods)].map((period) =>
      JSON.parse(period)
    );

    return uniquePeriods;
  }

  calculateSelectedPeriod(periods, { startDate, endDate }) {
    // Note: the assumptions: no messy data, i.e.
    // - no intersection between periods
    // - start < end
    const sortedPeriods = periods.sortBy('startDate');
    if (!(startDate || endDate)) {
      const today = moment(new Date()).format('YYYY-MM-DD');

      const currentPeriod = sortedPeriods.find(
        (p) => p.startDate <= today && (today < p.endDate || !p.endDate)
      );
      const firstfuturePeriod = sortedPeriods.find((p) => p.startDate > today);
      const firstPreviousPeriod = sortedPeriods.slice(-1)[0];

      return currentPeriod || firstfuturePeriod || firstPreviousPeriod;
    } else {
      return { startDate, endDate };
    }
  }

  getBestuursorganenForPeriod(bestuursorganen, period) {
    return bestuursorganen.filter((b) => {
      const start = moment(b.bindingStart).format('YYYY-MM-DD');
      const end = b.bindingEinde
        ? moment(b.bindingEinde).format('YYYY-MM-DD')
        : null;
      return start == period.startDate && end == period.endDate;
    });
  }

  @action
  reloadModel() {
    this.refresh();
  }
}
