import Model, { attr, belongsTo, hasMany } from '@ember-data/model';
import {
  MANDAAT_BURGEMEESTER_CODE,
  MANDAAT_DISTRICT_BURGEMEESTER_CODE,
  MANDAAT_DISTRICT_SCHEPEN_CODE,
  MANDAAT_SCHEPEN_CODE,
} from 'frontend-lmb/utils/well-known-uris';

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

  get isBurgemeester() {
    return [
      MANDAAT_BURGEMEESTER_CODE,
      MANDAAT_DISTRICT_BURGEMEESTER_CODE,
    ].includes(this.bestuursfunctie.get('uri'));
  }

  get isSchepen() {
    return [MANDAAT_SCHEPEN_CODE, MANDAAT_DISTRICT_SCHEPEN_CODE].includes(
      this.bestuursfunctie.get('uri')
    );
  }
}
