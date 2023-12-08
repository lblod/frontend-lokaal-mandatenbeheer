import Model from '@ember-data/model';
import { belongsTo } from '@ember-data/model';

export default class FormInstanceModel extends Model {
  @belongsTo('form-definition', {
    async: false,
    inverse: 'instances',
  })
  instance;
}
