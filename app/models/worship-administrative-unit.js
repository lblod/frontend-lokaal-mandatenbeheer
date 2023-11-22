import { belongsTo, hasMany } from '@ember-data/model';
import BestuurseenheidModel from './bestuurseenheid';

export default class WorshipAdministrativeUnitModel extends BestuurseenheidModel {
  @hasMany('minister-position', {
    async: true,
    inverse: 'worshipService',
    polymorphic: true,
    as: 'worship-administrative-unit',
  })
  ministerPositions;
}
