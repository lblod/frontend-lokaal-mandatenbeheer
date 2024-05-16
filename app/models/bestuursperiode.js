import { attr, hasMany } from '@ember-data/model';
import ConceptModel from './concept';

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
