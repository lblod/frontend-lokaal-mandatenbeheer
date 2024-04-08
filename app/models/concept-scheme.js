import Model, { attr, hasMany } from '@ember-data/model';

export default class ConceptSchemeModel extends Model {
  @attr uri;
  @attr label;

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
}
