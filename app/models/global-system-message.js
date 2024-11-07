import Model, { attr } from '@ember-data/model';

export default class GlobalSystemMessageModel extends Model {
  @attr uri;
  @attr message;
}
