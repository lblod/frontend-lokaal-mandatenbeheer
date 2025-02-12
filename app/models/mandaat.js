import Model, { attr, belongsTo, hasMany } from '@ember-data/model';

import {
  MANDAAT_AANGEWEZEN_BURGEMEESTER_CODE,
  MANDAAT_BURGEMEESTER_CODE,
  MANDAAT_DISTRICT_BURGEMEESTER_CODE,
  MANDAAT_DISTRICT_SCHEPEN_CODE,
  MANDAAT_GEDEPUTEERDE_CODE,
  MANDAAT_GEMEENTERAADSLID_CODE,
  MANDAAT_GOUVERNEUR_CODE,
  MANDAAT_SCHEPEN_CODE,
  MANDAAT_TOEGEVOEGDE_SCHEPEN_CODE,
} from 'frontend-lmb/utils/well-known-uris';

const identity = Boolean;

export default class MandaatModel extends Model {
  @attr uri;
  @attr aantalHouders;
  @attr minAantalHouders;
  @attr maxAantalHouders;

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
      MANDAAT_AANGEWEZEN_BURGEMEESTER_CODE,
      MANDAAT_DISTRICT_BURGEMEESTER_CODE,
    ].includes(this.bestuursfunctie.get('uri'));
  }

  get isStrictBurgemeester() {
    return this.bestuursfunctie.get('uri') === MANDAAT_BURGEMEESTER_CODE;
  }

  get isSchepen() {
    return [
      MANDAAT_SCHEPEN_CODE,
      MANDAAT_DISTRICT_SCHEPEN_CODE,
      MANDAAT_TOEGEVOEGDE_SCHEPEN_CODE,
      MANDAAT_GEDEPUTEERDE_CODE,
    ].includes(this.bestuursfunctie.get('uri'));
  }

  get isGemeenteraadslid() {
    return [MANDAAT_GEMEENTERAADSLID_CODE].includes(
      this.bestuursfunctie.get('uri')
    );
  }

  get isVoorzitter() {
    return this.bestuursfunctie.get('isVoorzitter');
  }

  get isGouverneur() {
    return this.bestuursfunctie.get('uri') == MANDAAT_GOUVERNEUR_CODE;
  }

  get hasRangorde() {
    return this.isSchepen || this.isGemeenteraadslid;
  }

  get allowsNonElectedPersons() {
    return new Promise((resolve) => {
      if (this.isGouverneur) {
        resolve(true);
      }
      this.isDecretaalHelper()
        .then((decretaal) => {
          if (!decretaal) {
            resolve(true);
          } else {
            resolve(this.isInBCSD());
          }
        })
        .catch((e) => {
          console.error(e);
          resolve(false);
        });
    });
  }

  get rangordeLabel() {
    if (this.isGemeenteraadslid) {
      return 'lid';
    }
    if (this.isSchepen) {
      return 'schepen';
    }
    return this.bestuursfunctie.get('label')?.toLowerCase();
  }

  async isInBCSD() {
    const bestuursorganen = await this.bevatIn;
    const booleans = await Promise.all(
      bestuursorganen.map(async (bo) => await bo.isBCSD)
    );
    return booleans.includes(true);
  }
}
