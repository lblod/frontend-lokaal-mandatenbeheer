import Model, { attr, belongsTo, hasMany } from '@ember-data/model';
import {
  BESTUURSEENHEID_CLASSIFICATIECODE_GEMEENTE,
  BESTUURSEENHEID_CLASSIFICATIECODE_OCMW,
} from 'frontend-lmb/utils/well-known-uris';

export default class Bestuurseenheid extends Model {
  @attr uri;
  @attr naam;
  @attr alternatieveNaam;
  @attr mailAdres;
  @attr wilMailOntvangen;
  @attr isTrialUser;
  @attr('boolean', { defaultValue: false }) hideLegislatuur;
  @attr viewOnlyModules;

  @belongsTo('werkingsgebied', {
    async: true,
    inverse: 'bestuurseenheid',
    polymorphic: true,
    as: 'bestuurseenheid',
  })
  werkingsgebied;

  @belongsTo('bestuurseenheid-classificatie-code', {
    async: true,
    inverse: null,
  })
  classificatie;

  @belongsTo('bestuurseenheid-contact', {
    async: true,
    inverse: null,
  })
  contact;

  @hasMany('bestuursorgaan', {
    async: true,
    inverse: 'bestuurseenheid',
    polymorphic: true,
    as: 'bestuurseenheid',
  })
  bestuursorganen;

  @hasMany('bestuursorgaan', {
    async: true,
    inverse: 'orginalBestuurseenheid',
  })
  fakeBestuursorganen;

  get isGemeente() {
    return (
      this.classificatie.get('uri') ===
      BESTUURSEENHEID_CLASSIFICATIECODE_GEMEENTE
    );
  }

  get isOCMW() {
    return (
      this.classificatie.get('uri') === BESTUURSEENHEID_CLASSIFICATIECODE_OCMW
    );
  }

  rdfaBindings = {
    naam: 'http://www.w3.org/2004/02/skos/core#prefLabel',
    class: 'http://data.vlaanderen.be/ns/besluit#Bestuurseenheid',
    werkingsgebied: 'http://data.vlaanderen.be/ns/besluit#werkingsgebied',
    bestuursorgaan: 'http://data.vlaanderen.be/ns/besluit#bestuurt',
    classificatie: 'http://data.vlaanderen.be/ns/besluit#classificatie',
  };
}
