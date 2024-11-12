import Model, { attr, hasMany } from '@ember-data/model';

export default class RechtstreekseVerkiezingModel extends Model {
  @attr('date') datum;
  @attr('date') geldigheid;

  @hasMany('bestuursorgaan', {
    async: true,
    inverse: 'verkiezing',
  })
  bestuursorganenInTijd;

  @hasMany('kandidatenlijst', {
    async: true,
    inverse: 'verkiezing',
  })
  kandidatenlijsten;

  get getLijsttype() {
    return this.kandidatenlijsten.slice().at(0).get('lijsttype').get('label');
  }
}
