import { attr, belongsTo, hasMany } from '@ember-data/model';
import Post from './post';

// INHERITS FROM POST(positie)
export default class MandaatModel extends Post {
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

  async isDecretaalHelper() {
    const bestuursorgaanPositions = await this.bevatIn;
    const areDecretaal = await Promise.all(
      bestuursorgaanPositions.map((position) => position.isDecretaal())
    );

    return areDecretaal.some(Boolean);
  }

  // If any of the bestuursorganen is decretaal, then the mandaat is decretaal.
  get isDecretaal() {
    return this.isDecretaalHelper();
  }
}
