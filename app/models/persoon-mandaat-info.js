import Model, { belongsTo } from '@ember-data/model';

export default class PersoonMandaatInfoModel extends Model {
  @belongsTo('mandaat', { async: true, inverse: null })
  bekleedt;

  @belongsTo('persoon', {
    async: true,
    inverse: null,
  })
  isBestuurlijkeAliasVan;
}
