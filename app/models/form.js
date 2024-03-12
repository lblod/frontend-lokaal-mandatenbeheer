import Model, { attr, hasMany } from '@ember-data/model';

export default class FormModel extends Model {
  @attr targetType;
  @attr targetLabel;
  @attr prefix;
  @attr id;
  @attr formTtl;
  @attr metaTtl;

  @hasMany('form-extension', {
    async: true,
    inverse: 'baseForm',
  })
  extensions;
}
