import Model, { belongsTo } from '@ember-data/model';

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
  bestuursorgaanInDeTijd;
}
