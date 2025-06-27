import Model, { attr, hasMany } from '@ember-data/model';

import moment from 'moment';

export default class ConceptSchemeModel extends Model {
  @attr uri;
  @attr label;
  @attr('datetime') createdAt;
  @attr('boolean', { defaultValue: true }) isReadOnly;

  @hasMany('concept', {
    async: true,
    inverse: 'conceptSchemes',
    polymorphic: true,
  })
  concepts;

  @hasMany('concept', {
    async: true,
    inverse: 'topConceptSchemes',
    polymorphic: true,
  })
  topConcepts;

  get displayCreatedAt() {
    if (!this.createdAt) {
      return 'Onbekend';
    }
    return moment(this.createdAt).format('DD-MM-YYYY h:mm:ss');
  }

  get displayLabel() {
    if (!this.label || this.label.trim() === '') {
      return this.uri;
    }

    return this.label;
  }
}
