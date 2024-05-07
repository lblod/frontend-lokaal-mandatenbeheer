import Model, { attr } from '@ember-data/model';

export default class BestuurseenheidContactInfoModel extends Model {
  @attr('string') uri;
  @attr('string') email;
}
