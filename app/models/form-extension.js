import Model, { belongsTo } from '@ember-data/model';

export default class FormExtensionModel extends Model {
  @belongsTo('form', {
    async: true,
    inverse: 'extensions',
  })
  baseForm;
}
