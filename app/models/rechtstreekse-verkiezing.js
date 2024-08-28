import Model, { attr, hasMany, belongsTo } from '@ember-data/model';

export default class RechtstreekseVerkiezingModel extends Model {
  @attr('date') datum;
  @attr('date') geldigheid;

  @belongsTo('bestuursorgaan', {
    async: true,
    inverse: 'verkiezing',
  })
  bestuursorgaanInTijd;

  @hasMany('kandidatenlijst', {
    async: true,
    inverse: 'verkiezing',
  })
  kandidatenlijsten;
}
