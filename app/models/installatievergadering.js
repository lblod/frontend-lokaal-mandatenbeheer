import Model, { belongsTo } from '@ember-data/model';
import { INSTALLATIEVERGADERING_TE_BEHANDELEN } from 'frontend-lmb/utils/well-known-ids';

export default class InstallatievergaderingModel extends Model {
  @belongsTo('installatievergadering-status', {
    async: true,
    inverse: null,
  })
  status;

  @belongsTo('bestuurseenheid', {
    async: true,
    inverse: null,
  })
  bestuurseenheid;

  @belongsTo('bestuursperiode', {
    async: true,
    inverse: 'installatievergaderingen',
  })
  bestuursperiode;

  get teBehandelen() {
    return this.status.id == INSTALLATIEVERGADERING_TE_BEHANDELEN;
  }
}
