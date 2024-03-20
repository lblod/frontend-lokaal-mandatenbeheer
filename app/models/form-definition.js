import Model from '@ember-data/model';
import { attr } from '@ember-data/model';

export default class FormDefinitionModel extends Model {
  @attr('string')
  formTtl;
  @attr('string')
  metaTtl;
  @attr('string')
  prefix;
  @attr withHistory;
}
