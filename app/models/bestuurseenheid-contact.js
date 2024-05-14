import Model, { attr } from '@ember-data/model';

export default class BestuurseenheidContactModel extends Model {
  @attr('string') uri;
  @attr('string') email;
}
