import Model, { attr, belongsTo, hasMany } from '@ember-data/model';
import { inject as service } from '@ember/service';

/**
 * Bestuursorgaan and bestuursorgaan in de tijd are not the same,
 * go via isTijdsspecialisatieVan to go to the real bestuursorgaan.
 * Use mandatendatabank schema for reference.
 */
export default class BestuursorgaanModel extends Model {
  @service decretaleOrganen;

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
      ? await bestuursorgaan.get('classificatie.uri')
      : await this.classificatie.get('uri');
  }

  get isDecretaal() {
    return this.classificatieUri().then((uri) => {
      return this.decretaleOrganen.codeUris.some((dcUri) => dcUri === uri);
    });
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
