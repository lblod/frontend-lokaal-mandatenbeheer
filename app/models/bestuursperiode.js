import ConceptModel from './concept';

import { attr, hasMany } from '@ember-data/model';

export default class BestuursperiodeModel extends ConceptModel {
  @attr('number') start;
  @attr('number') einde;

  @hasMany('bestuursorgaan', {
    async: true,
    inverse: 'heeftBestuursperiode',
  })
  heeftBestuursorganenInTijd;

  @hasMany('installatievergadering', {
    async: true,
    inverse: 'bestuursperiode',
  })
  installatievergaderingen;
}
