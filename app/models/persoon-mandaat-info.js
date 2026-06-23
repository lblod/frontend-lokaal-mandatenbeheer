import Model, { belongsTo } from '@ember-data/model';

export default class PersoonMandaatInfoModel extends Model {
  @belongsTo('mandaat', { async: true, inverse: null })
  mandaat;

  @belongsTo('persoon', {
    async: true,
    inverse: null,
  })
  persoon;
}
