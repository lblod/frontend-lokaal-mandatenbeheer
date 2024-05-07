import { attr, hasMany } from '@ember-data/model';
import ConceptModel from './concept';

export default class BeleidsdomeinCodeModel extends ConceptModel {
  @attr start;
  @attr einde;

  @hasMany('bestuursorgaan', {
    async: true,
    inverse: 'heeftBestuursperiode',
  })
  heeftBestuursorganenInTijd;
}
