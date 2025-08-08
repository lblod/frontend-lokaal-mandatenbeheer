import Model, { attr, belongsTo, hasMany } from '@ember-data/model';
import moment from 'moment';

export default class FractieModel extends Model {
  @attr uri;
  @attr naam;
  @attr('uri-set') generatedFrom;
  @attr('datetime') modified;
  @attr('datetime') endDate;
  @attr('datetime') startDate;

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

  @belongsTo('fractie', {
    async: true,
    inverse: null,
  })
  replacement;

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

  get startDateLabel() {
    if (!this.startDate) {
      return 'Onbekend';
    }

    return moment(this.startDate).format('DD-MM-YYYY');
  }

  get endDateLabel() {
    if (!this.endDate) {
      return 'Heden';
    }

    return moment(this.endDate).format('DD-MM-YYYY');
  }
}
