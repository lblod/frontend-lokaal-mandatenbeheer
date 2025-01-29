import Model, { attr, belongsTo } from '@ember-data/model';

export default class LibraryEntryModel extends Model {
  @attr uri;
  @attr name;
  @attr path;
  @attr options;

  @belongsTo('display-type', {
    async: true,
    inverse: null,
  })
  displayType;
}
