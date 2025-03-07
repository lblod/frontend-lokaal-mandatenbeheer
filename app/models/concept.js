import Model, { attr, hasMany } from '@ember-data/model';

export default class ConceptModel extends Model {
  @attr uri;
  @attr label;
  @attr('number') order;

  @hasMany('concept-scheme', {
    async: true,
    inverse: 'concepts',
    as: 'concept',
  })
  conceptSchemes;

  @hasMany('concept-scheme', {
    async: true,
    inverse: 'topConcepts',
    as: 'concept',
  })
  topConceptSchemes;
}
