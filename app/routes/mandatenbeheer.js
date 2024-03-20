import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import RSVP from 'rsvp';
import moment from 'moment';

export default class MandatenbeheerRoute extends Route {
  @service currentSession;
  @service session;
  @service router;
  @service store;

  startDate;
  endDate;

  queryParams = {
    startDate: { refreshModel: true },
    endDate: { refreshModel: true },
  };

  beforeModel(transition) {
    this.session.requireAuthentication(transition, 'login');

    if (!this.currentSession.canAccessMandaat) {
      this.router.transitionTo('index');
    }
  }

  async model(params) {
    this.startDate = params.startDate;
    this.endDate = params.endDate;

    const bestuurseenheid = this.currentSession.group;
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

    return RSVP.hash({
      bestuurseenheid,
      bestuursorganen: selectedBestuursOrganen,
      bestuursperiods,
      selectedPeriod,
    });
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
}
