import Model, { belongsTo } from '@ember-data/model';
import { INSTALLATIEVERGADERING_TE_BEHANDELEN } from 'frontend-lmb/utils/well-known-ids';

export default class InstallatievergaderingModel extends Model {
  @belongsTo('installatievergadering-status', {
    async: true,
    inverse: null,
  })
  status;

  @belongsTo('bestuursorgaan', {
    async: true,
    inverse: null,
  })
  bestuursorgaanInTijd;

  get teBehandelen() {
    return this.status.id == INSTALLATIEVERGADERING_TE_BEHANDELEN;
  }
}
