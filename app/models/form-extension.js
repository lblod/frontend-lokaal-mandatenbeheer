import Model, { belongsTo } from '@ember-data/model';

export default class FormExtensionModel extends Model {
  @belongsTo('form', {
    async: true,
    inverse: 'form-extension',
    polymorphic: true,
    as: 'form-extension',
  })
  classificatie;
}
