import { OVERIGE_BESTUURSPERIODE } from 'frontend-lmb/utils/well-known-uris';
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

  get detailedViewLabel() {
    if (this.uri === OVERIGE_BESTUURSPERIODE) {
      return '';
    }
    return this.label;
  }
}
