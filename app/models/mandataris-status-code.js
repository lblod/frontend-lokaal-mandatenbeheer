import Model, { attr } from '@ember-data/model';

export default class MandatarisStatusCodeModel extends Model {
  @attr label;
  @attr uri;
}
