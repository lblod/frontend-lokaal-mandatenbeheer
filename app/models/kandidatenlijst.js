import Model, { attr, hasMany, belongsTo } from '@ember-data/model';

export default class KandidatenlijstModel extends Model {
  @attr lijstnaam;
  @attr('number') lijstnummer;

  @belongsTo('lijsttype', {
    async: true,
    inverse: null,
  })
  lijsttype;

  @belongsTo('rechtstreekse-verkiezing', {
    async: true,
    inverse: 'kandidatenlijsten',
  })
  verkiezing;

  @hasMany('persoon', {
    async: true,
    inverse: null,
  })
  kandidaten;

  @hasMany('verkiezingsresultaat', {
    async: true,
    inverse: 'kandidatenlijst',
  })
  resultaten;

  @hasMany('fractie', {
    async: true,
    inverse: 'origineleKandidatenlijst',
  })
  resulterendeFracties;

  get splitted() {
    const fracties = this.resulterendeFracties;
    return fracties && fracties.length > 0;
  }
}
