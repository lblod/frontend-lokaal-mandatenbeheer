import Model, { attr, hasMany } from '@ember-data/model';
import moment from 'moment';

export default class FormModel extends Model {
  @attr targetType;
  @attr targetLabel;
  @attr name;
  @attr description;
  @attr('datetime') createdAt;
  @attr('datetime') modifiedAt;
  @attr prefix;
  // @attr id; // Should be removed to fetch the forms from the store
  @attr formTtl;
  @attr metaTtl;

  @hasMany('form-extension', {
    async: true,
    inverse: 'baseForm',
  })
  extensions;

  get displayCreatedDate() {
    if (!this.createdAt) {
      return 'Onbekend';
    }
    return moment(this.createdAt).format('DD-MM-YYYY h:mm:ss');
  }

  get displayModifiedDate() {
    if (!this.modifiedAt) {
      return 'Onbekend';
    }
    return moment(this.modifiedAt).format('DD-MM-YYYY h:mm:ss');
  }
}
