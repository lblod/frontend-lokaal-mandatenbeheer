import Model, { attr } from '@ember-data/model';

export default class FormLibraryDisplayTypeModel extends Model {
  @attr uri;
  @attr label;
}
