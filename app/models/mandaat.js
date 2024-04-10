import Model, { attr, belongsTo, hasMany } from '@ember-data/model';

const identity = Boolean;

export default class MandaatModel extends Model {
  @attr uri;
  @attr aantalHouders;

  @belongsTo('bestuursfunctie-code', {
    async: true,
    inverse: null,
  })
  bestuursfunctie;

  @hasMany('bestuursorgaan', {
    async: true,
    inverse: 'bevat',
  })
  bevatIn;

  @hasMany('mandataris', {
    async: true,
    inverse: 'bekleedt',
  })
  bekleedDoor;

  async isDecretaalHelper() {
    const bestuursorganen = await this.bevatIn;
    const areDecretaal = await Promise.all(
      bestuursorganen.map((orgaan) => orgaan.isDecretaal)
    );

    return areDecretaal.some(identity);
  }

  // If any of the bestuursorganen is decretaal, then the mandaat is decretaal.
  get isDecretaal() {
    return this.isDecretaalHelper();
  }
}
