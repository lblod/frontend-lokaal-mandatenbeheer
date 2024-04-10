import Model, { hasMany } from '@ember-data/model';

export default class PostModel extends Model {
  @hasMany('agent-in-position', {
    async: true,
    inverse: 'post',
    polymorphic: true,
    as: 'post',
  })
  agentsInPosition;
}
