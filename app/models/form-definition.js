import Model from '@ember-data/model';
import { attr, hasMany } from '@ember-data/model';

export default class FormDefinitionModel extends Model {
  @attr('string')
  formTtl;
  @attr('string')
  metaTtl;
  @attr('string')
  prefix;
  @attr withHistory;

  @hasMany('form-instance', {
    async: false,
    inverse: 'definition',
  })
  instances;
}
