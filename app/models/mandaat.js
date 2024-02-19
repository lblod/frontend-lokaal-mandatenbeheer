import { attr, belongsTo, hasMany } from '@ember-data/model';
import Post from './post';

const identity = Boolean;

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
