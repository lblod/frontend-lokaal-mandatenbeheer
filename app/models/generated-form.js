import FormModel from './form';

import { attr } from '@ember-data/model';

import moment from 'moment';

export default class GeneratedFormModel extends FormModel {
  @attr name;
  @attr description;
  @attr('datetime') createdAt;
  @attr('datetime') modifiedAt;
  @attr hasBaseForm;

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
