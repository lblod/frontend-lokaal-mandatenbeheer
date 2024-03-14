import Model, { attr, belongsTo } from '@ember-data/model';

export default class VerkiezingsresultaatModel extends Model {
  @attr('number') aantalNaamstemmen;
  @attr('number') plaatsRangorde;

  @belongsTo('persoon', { async: true, inverse: null })
  persoon;

  @belongsTo('kandidatenlijst', { async: true, inverse: 'resultaten' })
  kandidatenlijst;

  @belongsTo('verkiezingsresultaat-gevolg-code', { async: true, inverse: null })
  gevolg;
}
