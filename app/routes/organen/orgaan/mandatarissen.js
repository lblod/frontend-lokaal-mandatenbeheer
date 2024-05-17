import Route from '@ember/routing/route';
import { service } from '@ember/service';
import moment from 'moment';
import { getFormFrom } from 'frontend-lmb/utils/get-form';
import { MANDATARIS_NEW_FORM_ID } from 'frontend-lmb/utils/well-known-ids';

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
    const mandatarisNewForm = await getFormFrom(
      this.store,
      MANDATARIS_NEW_FORM_ID
    );

    return {
      mandatarissen: this.reSortMandatarissen(params, unsorted),
      bestuursorgaan: parentModel.bestuursorgaan,
      selectedBestuursperiode: parentModel.selectedBestuursperiode,
      mandatarisNewForm: mandatarisNewForm,
      currentBestuursorgaan: currentBestuursorgaan,
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
        return folded.mandataris.get('heeftLidmaatschap.binnenFractie.naam');
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
    // 'persoonId-mandaatId' to foldedMandataris
    const persoonMandaatData = {};
    await Promise.all(
      mandatarissen.map(async (mandataris) => {
        const personId = (await mandataris.isBestuurlijkeAliasVan).id;
        const mandaatId = (await mandataris.bekleedt).id;
        const key = `${personId}-${mandaatId}`;
        const existing = persoonMandaatData[key];

        if (existing) {
          this.updateFoldedMandataris(mandataris, existing);
          return;
        }
        persoonMandaatData[key] = this.buildFoldedMandataris(mandataris);
      })
    );
    return Object.values(persoonMandaatData).map(
      ({ foldedStart, foldedEnd, mandataris }) => {
        return {
          foldedStart,
          foldedEnd,
          mandataris,
        };
      }
    );
  }

  updateFoldedMandataris(mandataris, foldedMandataris) {
    this.updateFoldedStart(mandataris, foldedMandataris);
    this.updateFoldedEnd(mandataris, foldedMandataris);
    this.updateMandataris(mandataris, foldedMandataris);
  }

  updateFoldedStart(mandataris, foldedMandataris) {
    if (!mandataris.start || !foldedMandataris.foldedStart) {
      foldedMandataris.foldedStart = null;
    } else {
      foldedMandataris.foldedStart = moment.min(
        moment(foldedMandataris.foldedStart),
        moment(mandataris.start)
      );
    }
  }

  updateFoldedEnd(mandataris, foldedMandataris) {
    if (!mandataris.einde || !foldedMandataris.foldedEnd) {
      foldedMandataris.foldedEnd = null;
    } else {
      foldedMandataris.foldedEnd = moment.max(
        moment(foldedMandataris.foldedEnd),
        moment(mandataris.einde)
      );
    }
  }

  updateMandataris(mandataris, foldedMandataris) {
    // Keep the one with the latest end date. If the end date is null,
    // we assume this is the latest one.
    if (
      moment(mandataris.einde).isSame(foldedMandataris.foldedEnd) ||
      !mandataris.einde
    ) {
      foldedMandataris.mandataris = mandataris;
    }
  }

  buildFoldedMandataris(mandataris) {
    return {
      foldedStart: mandataris.start,
      foldedEnd: mandataris.einde,
      mandataris,
    };
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
