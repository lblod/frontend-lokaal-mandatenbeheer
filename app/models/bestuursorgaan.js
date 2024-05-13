import Model, { attr, belongsTo, hasMany } from '@ember-data/model';
import { inject as service } from '@ember/service';
import { queryRecord } from 'frontend-lmb/utils/query-record';

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
  @attr('date') bindingStart;
  @attr('date') bindingEinde;
  @attr('date') deactivatedAt;

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
    inverse: 'bestuursorgaanInTijd',
  })
  verkiezing;

  @hasMany('bestuursorgaan', {
    async: true,
    inverse: 'isTijdsspecialisatieVan',
  })
  heeftTijdsspecialisaties;

  @hasMany('bestuursfunctie', {
    async: true,
    inverse: null,
  })
  bevatBestuursfunctie;

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

  get notDecretaal() {
    return this.isDecretaal.then((val) => !val);
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

  get nbMembers() {
    return this.getNbMembers();
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
    });

    const mandaten = currentOrgaan ? await currentOrgaan.bevat : [];
    // TODO not entirely correct, can contain inactive mandatarissen...
    const mandatenAmounts = await Promise.all(
      mandaten.map(async (mandaat) => {
        return (await mandaat.bekleedDoor).meta.count;
      })
    );
    const amount = mandatenAmounts.reduce((acc, curr) => acc + curr, 0);
    return amount;
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
}
