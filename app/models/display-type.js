import Model, { attr } from '@ember-data/model';

export default class DisplayTypeModel extends Model {
  @attr label;
  @attr uri;
}
