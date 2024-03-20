import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import moment from 'moment';

export default class OrganenMandatarissenRoute extends Route {
  @service store;

  queryParams = {
    filter: { refreshModel: true },
    page: { refreshModel: true },
    size: { refreshModel: true },
    sort: { refreshModel: true },
  };

  async model(params) {
    const parentModel = this.modelFor('organen.orgaan');
    const currentBestuursorgaan = await parentModel.currentBestuursorgaan;

    let mandatarissen;
    if (currentBestuursorgaan) {
      const options = this.getOptions(params, currentBestuursorgaan);

      mandatarissen = await this.store.query('mandataris', options);
    }

    return {
      mandatarissen: await this.foldMandatarissen(mandatarissen),
    };
  }

  async foldMandatarissen(mandatarissen) {
    const personMandaatData = {};
    const folded = [];
    await Promise.all(
      mandatarissen.map(async (mandataris) => {
        const personId = (await mandataris.isBestuurlijkeAliasVan).id;
        const mandaatId = (await mandataris.bekleedt).id;
        const key = `${personId}-${mandaatId}`;
        const existing = personMandaatData[key];
        if (existing) {
          existing.foldedStart = moment.min(
            moment(existing.foldedStart),
            moment(mandataris.start)
          );
          if (!mandataris.einde || !existing.foldedEnd) {
            existing.foldedEnd = null;
          } else {
            existing.foldedEnd = moment.max(
              moment(existing.foldedEnd),
              moment(mandataris.einde)
            );
          }
          if (moment(mandataris.einde).isSame(existing.foldedEnd)) {
            // keep the one with the oldest end date
            existing.mandataris = mandataris;
          }
          const fractie = mandataris.get(
            'heeftLidmaatschap.binnenFractie.naam'
          );
          if (fractie && !existing.foldedFracties.includes(fractie)) {
            existing.foldedFracties.push(fractie);
          }
        } else {
          const fractie = mandataris.get(
            'heeftLidmaatschap.binnenFractie.naam'
          );
          let fracties = [];
          if (fractie) {
            fracties = [fractie];
          }
          const firstOccurrence = {
            foldedStart: mandataris.start,
            foldedEnd: mandataris.einde,
            mandataris,
            foldedFracties: fracties,
          };
          personMandaatData[key] = firstOccurrence;
          folded.push(firstOccurrence);
        }
      })
    );
    return folded.map((entry) => {
      return {
        mandataris: entry.mandataris,
        foldedStart: entry.foldedStart,
        foldedEnd: entry.foldedEnd,
        foldedFracties: entry.foldedFracties.join(', '),
      };
    });
  }

  getOptions(params, bestuursOrgaan) {
    const queryParams = {
      sort: params.sort,
      page: {
        number: params.page,
        size: params.size,
      },
      filter: {
        bekleedt: {
          'bevat-in': {
            id: bestuursOrgaan.id,
          },
        },
      },
      include: [
        'is-bestuurlijke-alias-van',
        'bekleedt.bestuursfunctie',
        'heeft-lidmaatschap.binnen-fractie',
      ].join(','),
    };

    if (params.filter) {
      queryParams['filter']['is-bestuurlijke-alias-van'] = params.filter;
    }

    return queryParams;
  }
}
