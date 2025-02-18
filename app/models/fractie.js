import Model, { attr, belongsTo, hasMany } from '@ember-data/model';

export default class FractieModel extends Model {
  @attr uri;
  @attr naam;
  @attr('uri-set') generatedFrom;
  @attr('datetime') modified;

  @belongsTo('fractietype', {
    async: true,
    inverse: null,
  })
  fractietype;

  @hasMany('bestuursorgaan', {
    async: true,
    inverse: null,
  })
  bestuursorganenInTijd;

  @belongsTo('bestuurseenheid', {
    async: true,
    inverse: null,
  })
  bestuurseenheid;

  @belongsTo('kandidatenlijst', {
    async: true,
    inverse: 'resulterendeFracties',
  })
  origineleKandidatenlijst;

  get isOnafhankelijk() {
    return this.fractietype.get('isOnafhankelijk');
  }

  get isSamenwerkingsverband() {
    return this.fractietype.get('isSamenwerkingsverband');
  }

  get generatedFromGelinktNotuleren() {
    return (this.generatedFrom || []).some(
      (uri) =>
        uri == 'http://mu.semte.ch/vocabularies/ext/mandatenExtractorService'
    );
  }

  get validationText() {
    return this.naam;
  }
}
