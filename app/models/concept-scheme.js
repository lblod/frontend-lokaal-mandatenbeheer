import Model, { attr, hasMany } from '@ember-data/model';

import moment from 'moment';

export default class ConceptSchemeModel extends Model {
  @attr uri;
  @attr label;
  @attr('datetime') createdAt;
  @attr('boolean') isReadOnly;

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

  get readOnly() {
    return this.isReadOnly ?? true;
  }

  get displayCreatedAt() {
    if (!this.createdAt) {
      return null;
    }
    return moment(this.createdAt).format('DD-MM-YYYY h:mm:ss');
  }
}
