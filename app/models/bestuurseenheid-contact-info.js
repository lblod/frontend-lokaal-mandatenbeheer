import Model, { attr, belongsTo } from '@ember-data/model';

export default class BestuurseenheidContactInfoModel extends Model {
  @attr uri;
  @attr email;

  @belongsTo('bestuurseenheid', {
    async: true,
    inverse: null,
  })
  bestuurseenheid;
}
