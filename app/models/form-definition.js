import Model, { attr } from '@ember-data/model';

export default class FormDefinitionModel extends Model {
  @attr('string')
  formTtl;
  @attr('string')
  metaTtl;
  @attr('string')
  prefix;
  @attr withHistory;
}
