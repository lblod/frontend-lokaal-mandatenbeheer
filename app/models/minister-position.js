import { belongsTo, hasMany } from '@ember-data/model';
import Post from './post';

export default class MinisterPositionModel extends Post {
  @belongsTo('minister-position-function', {
    async: true,
    inverse: null,
  })
  function;

  @belongsTo('worship-administrative-unit', {
    async: true,
    inverse: 'ministerPositions',
    polymorphic: true,
    as: 'minister-position',
  })
  worshipService;

  @hasMany('minister', {
    async: true,
    inverse: 'ministerPosition',
  })
  heldByMinisters;
}
