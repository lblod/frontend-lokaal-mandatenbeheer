import Model, { attr, hasMany } from '@ember-data/model';

export default class FormModel extends Model {
  @attr targetType;
  @attr targetLabel;
  @attr prefix;
  // @attr id; // SHould bve removed to fetch the forms from the store
  @attr formTtl;
  @attr metaTtl;

  @hasMany('form-extension', {
    async: true,
    inverse: 'baseForm',
  })
  extensions;
}
