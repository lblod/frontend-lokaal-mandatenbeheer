import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { toUserReadableListing } from 'frontend-lmb/utils/to-user-readable-listing';
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
      bestuursorgaan: parentModel.bestuursorgaan,
      selectedBestuursperiode: parentModel.selectedBestuursperiode,
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
    // 'persoonId-mandaatId' to foldedMandataris
    const persoonMandaatData = {};
    await Promise.all(
      mandatarissen.map(async (mandataris) => {
        const personId = (await mandataris.isBestuurlijkeAliasVan).id;
        const mandaatId = (await mandataris.bekleedt).id;
        const fractie = mandataris.get('heeftLidmaatschap.binnenFractie.naam');
        const key = `${personId}-${mandaatId}`;
        const existing = persoonMandaatData[key];

        if (existing) {
          this.updateFoldedMandataris(mandataris, fractie, existing);
          return;
        }
        const firstOccurrence = this.buildFoldedMandataris(mandataris, fractie);
        persoonMandaatData[key] = firstOccurrence;
      })
    );
    return Object.values(persoonMandaatData).map(
      ({ foldedStart, foldedEnd, mandataris, fractie, foldedFracties }) => {
        return {
          foldedStart,
          foldedEnd,
          mandataris,
          foldedFracties: this.fractiesToString(fractie, foldedFracties),
        };
      }
    );
  }

  updateFoldedMandataris(mandataris, fractie, foldedMandataris) {
    this.updateFoldedStart(mandataris, foldedMandataris);
    this.updateFoldedEnd(mandataris, foldedMandataris);
    this.updateFoldedFracties(fractie, foldedMandataris);
    this.updateFoldedMandatarisAndFractie(
      mandataris,
      fractie,
      foldedMandataris
    );
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

  updateFoldedFracties(fractie, foldedMandataris) {
    if (fractie && !foldedMandataris.foldedFracties.includes(fractie)) {
      foldedMandataris.foldedFracties.push(fractie);
    }
  }

  updateFoldedMandatarisAndFractie(mandataris, fractie, foldedMandataris) {
    // keep the one with the latest end date (if it is null, we assume this is the latest one)
    if (
      moment(mandataris.einde).isSame(foldedMandataris.foldedEnd) ||
      !mandataris.einde
    ) {
      foldedMandataris.mandataris = mandataris;
      foldedMandataris.fractie = fractie;
    }
  }

  buildFoldedMandataris(mandataris, fractie) {
    const fracties = fractie ? [fractie] : [];

    return {
      foldedStart: mandataris.start,
      foldedEnd: mandataris.einde,
      mandataris,
      fractie,
      foldedFracties: fracties,
    };
  }

  fractiesToString(currentFractie, allFracties) {
    const sortedFracties = allFracties
      .filter((f) => f != currentFractie && f) // TODO the "&& f" is confusing
      .toSorted((a, b) => a.localeCompare(b));
    return sortedFracties.length
      ? `${currentFractie} (${toUserReadableListing(sortedFracties)})`
      : currentFractie;
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
