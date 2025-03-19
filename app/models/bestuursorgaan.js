import Model, { attr, belongsTo, hasMany } from '@ember-data/model';

import { service } from '@ember/service';

import { API } from 'frontend-lmb/utils/constants';
import { handleResponseWithDefault } from 'frontend-lmb/utils/handle-response';

import { queryRecord } from 'frontend-lmb/utils/query-record';
import { POLITIERAAD_CODE_ID } from 'frontend-lmb/utils/well-known-ids';
import {
  BCSD_BESTUURSORGAAN_URI,
  BURGEMEESTER_BESTUURSORGAAN_URI,
  CBS_BESTUURSORGAAN_URI,
  GEMEENTERAAD_BESTUURSORGAAN_URI,
  RMW_BESTUURSORGAAN_URI,
  VAST_BUREAU_BESTUURSORGAAN_URI,
} from 'frontend-lmb/utils/well-known-uris';

/**
 * Bestuursorgaan and bestuursorgaan in de tijd are not the same,
 * go via isTijdsspecialisatieVan to go to the real bestuursorgaan.
 * Use mandatendatabank schema for reference.
 */
export default class BestuursorgaanModel extends Model {
  @service decretaleOrganen;
  @service bestuursperioden;
  @service store;
  @service router;

  @attr uri;
  @attr naam;
  @attr('datetime') bindingStart;
  @attr('datetime') bindingEinde;
  @attr('datetime') deactivatedAt;

  get isActive() {
    return !this.deactivatedAt;
  }

  @belongsTo('bestuurseenheid', {
    async: true,
    inverse: 'bestuursorganen',
    polymorphic: true,
    as: 'bestuursorgaan',
  })
  bestuurseenheid;

  @belongsTo('bestuurseenheid', {
    async: true,
    inverse: 'fakeBestuursorganen',
  })
  orginalBestuurseenheid;

  @belongsTo('bestuursorgaan-classificatie-code', {
    async: true,
    inverse: null,
  })
  classificatie;

  @belongsTo('bestuursorgaan', {
    async: true,
    inverse: 'heeftTijdsspecialisaties',
  })
  isTijdsspecialisatieVan;

  @belongsTo('bestuursperiode', {
    async: true,
    inverse: 'heeftBestuursorganenInTijd',
  })
  heeftBestuursperiode;

  @belongsTo('rechtstreekse-verkiezing', {
    async: true,
    inverse: 'bestuursorganenInTijd',
  })
  verkiezing;

  @hasMany('bestuursorgaan', {
    async: true,
    inverse: 'isTijdsspecialisatieVan',
  })
  heeftTijdsspecialisaties;

  @hasMany('mandaat', {
    async: true,
    inverse: 'bevatIn',
  })
  bevat;

  async classificatieUri() {
    const bestuursorgaan = await this.isTijdsspecialisatieVan;
    return bestuursorgaan
      ? await (
          await bestuursorgaan.classificatie
        ).uri
      : (await this.classificatie)?.get('uri');
  }

  get isDecretaal() {
    return this.classificatieUri().then((uri) => {
      return this.decretaleOrganen.decretaleCodeUris.some(
        (dcUri) => dcUri === uri
      );
    });
  }

  get isGemeentelijk() {
    return this.classificatieUri().then((uri) => {
      return this.decretaleOrganen.gemeenteCodeUris.some(
        (dcUri) => dcUri === uri
      );
    });
  }

  get containsPoliticalMandates() {
    return this.classificatieUri().then((uri) => {
      return this.decretaleOrganen.classificatieUris.some(
        (dcUri) => dcUri === uri
      );
    });
  }

  async hasBestuursorgaanClassificatie(classificatie) {
    return this.classificatieUri().then((uri) => {
      return classificatie === uri;
    });
  }

  get nbMembers() {
    return this.getNbMembers();
  }

  get isBCSD() {
    return this.hasBestuursorgaanClassificatie(BCSD_BESTUURSORGAAN_URI);
  }

  get isGR() {
    return this.hasBestuursorgaanClassificatie(GEMEENTERAAD_BESTUURSORGAAN_URI);
  }

  get isCBS() {
    return this.hasBestuursorgaanClassificatie(CBS_BESTUURSORGAAN_URI);
  }

  get isRMW() {
    return this.hasBestuursorgaanClassificatie(RMW_BESTUURSORGAAN_URI);
  }

  get isVastBureau() {
    return this.hasBestuursorgaanClassificatie(VAST_BUREAU_BESTUURSORGAAN_URI);
  }

  get isBurgemeester() {
    return this.hasBestuursorgaanClassificatie(BURGEMEESTER_BESTUURSORGAAN_URI);
  }

  get hasRangorde() {
    return Promise.all([this.isCBS, this.isGR]).then((promise) => {
      return promise.some((value) => value);
    });
  }

  get hasVoorzitter() {
    return [
      GEMEENTERAAD_BESTUURSORGAAN_URI,
      RMW_BESTUURSORGAAN_URI,
      VAST_BUREAU_BESTUURSORGAAN_URI,
      BCSD_BESTUURSORGAAN_URI,
    ].includes(this.isTijdsspecialisatieVan.get('classificatie').get('uri'));
  }

  async getNbMembers() {
    const queryParam = this.router.currentRoute.queryParams.bestuursperiode;
    // TODO look if we can prevent these queries.
    const bestuursPeriods = await this.store.query('bestuursperiode', {
      sort: 'label',
    });
    const tijdsperiode = this.bestuursperioden.getRelevantPeriod(
      bestuursPeriods,
      queryParam
    );

    const currentOrgaan = await queryRecord(this.store, 'bestuursorgaan', {
      'filter[is-tijdsspecialisatie-van][:id:]': this.id,
      'filter[heeft-bestuursperiode][:id:]': tijdsperiode.id,
      include: 'bevat',
    });

    if (!currentOrgaan?.id) {
      return null;
    }

    const response = await fetch(
      `${API.MANDATARIS_SERVICE}/organen/${currentOrgaan.id}/activeMembers`
    );
    return await handleResponseWithDefault(response, (x) => x?.count ?? 0, 0);
  }

  rdfaBindings = {
    naam: 'http://www.w3.org/2004/02/skos/core#prefLabel',
    class: 'http://data.vlaanderen.be/ns/besluit#Bestuursorgaan',
    bindingStart: 'http://data.vlaanderen.be/ns/mandaat#bindingStart',
    bindingEinde: 'http://data.vlaanderen.be/ns/mandaat#bindingEinde',
    bestuurseenheid: 'http://data.vlaanderen.be/ns/besluit#bestuurt',
    classificatie: 'http://data.vlaanderen.be/ns/besluit#classificatie',
    isTijdsspecialisatieVan:
      'http://data.vlaanderen.be/ns/mandaat#isTijdspecialisatieVan',
    bevat: 'http://www.w3.org/ns/org#hasPost',
  };

  get validationText() {
    const org = this.isTijdsspecialisatieVan;
    if (org) {
      return `${org.get('classificatie.label')} ${this.bindingStart} - ${this.bindingEinde}`;
    } else {
      // eslint-disable-next-line ember/no-get, ember/classic-decorator-no-classic-methods
      return this.get('classificatie.label');
    }
  }

  get isPolitieraad() {
    return this.classificatie?.id == POLITIERAAD_CODE_ID;
  }
}
