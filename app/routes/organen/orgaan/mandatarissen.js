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

    const unsorted = await this.foldMandatarissen(mandatarissen);

    return {
      mandatarissen: this.reSortMandatarissen(params, unsorted),
    };
  }

  reSortMandatarissen(params, mandatarissen) {
    const needsResort = ![
      'start',
      'einde',
      'heeft-lidmaatschap.binnen-fractie.naam',
    ].find((resortKey) => {
      params.sort.includes(resortKey);
    });
    if (!needsResort) {
      // can trust api to have sorted properly since we haven't recombined these fields in a possibly destructive way
      return mandatarissen;
    }

    const getValue = (folded, key) => {
      if (key.indexOf('heeft-lidmaatschap.binnen-fractie.naam') >= 0) {
        return folded.foldedFracties;
      }
      if (key.indexOf('start') >= 0) {
        return (
          folded.foldedStart && moment(folded.foldedStart).format('YYYY-MM-DD')
        );
      }
      if (key.indexOf('einde') >= 0) {
        return (
          folded.foldedEnd && moment(folded.foldedEnd).format('YYYY-MM-DD')
        );
      }
      return null;
    };

    return mandatarissen.sort((a, b) => {
      const aVal = getValue(a, params.sort);
      const bVal = getValue(b, params.sort);
      if (aVal === bVal) {
        return 0;
      }
      let result = 0;
      if (aVal === null) {
        result = 1;
      }
      if (bVal === null) {
        result = -1;
      }
      if (aVal > bVal) {
        result = 1;
      } else {
        result = -1;
      }

      if (params.sort.indexOf('-') === 0) {
        return result * -1;
      }
      return result;
    });
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
          if (!mandataris.start || !existing.foldedStart) {
            existing.foldedStart = null;
          } else {
            existing.foldedStart = moment.min(
              moment(existing.foldedStart),
              moment(mandataris.start)
            );
          }
          if (!mandataris.einde || !existing.foldedEnd) {
            existing.foldedEnd = null;
          } else {
            existing.foldedEnd = moment.max(
              moment(existing.foldedEnd),
              moment(mandataris.einde)
            );
          }
          const fractie = mandataris.get(
            'heeftLidmaatschap.binnenFractie.naam'
          );
          if (fractie && !existing.foldedFracties.includes(fractie)) {
            existing.foldedFracties.push(fractie);
          }
          if (moment(mandataris.einde).isSame(existing.foldedEnd)) {
            // keep the one with the oldest end date
            existing.mandataris = mandataris;
            existing.fractie = fractie;
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
            fractie: fractie,
          };
          personMandaatData[key] = firstOccurrence;
          folded.push(firstOccurrence);
        }
      })
    );
    return folded.map((entry) => {
      const fracties = entry.foldedFracties;
      fracties.sort((a, b) => a.localeCompare(b));
      const currentFractie = entry.fractie;
      const otherFracties = fracties.filter((f) => f != entry.fractie && f);
      const fractieText = otherFracties.length
        ? `${currentFractie} (${otherFracties.join(', ')})`
        : currentFractie;
      return {
        mandataris: entry.mandataris,
        foldedStart: entry.foldedStart,
        foldedEnd: entry.foldedEnd,
        foldedFracties: fractieText,
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
        'status',
      ].join(','),
    };

    if (params.filter) {
      queryParams['filter']['is-bestuurlijke-alias-van'] = params.filter;
    }

    return queryParams;
  }
}
