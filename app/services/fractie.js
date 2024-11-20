import Service from '@ember/service';

import { service } from '@ember/service';
import { fold } from 'frontend-lmb/utils/fold-mandatarisses';

import { FRACTIETYPE_ONAFHANKELIJK } from 'frontend-lmb/utils/well-known-uris';

export default class FractieService extends Service {
  @service store;
  @service bestuursperioden;

  // ---------------------  WARNING ---------------------
  // if an onafhankelijke fractie is created, is it not saved yet.
  // save it before use!
  // this is to avoid too many tombstones being created for unused fracties
  // ---------------------  WARNING ----------------
  async createOnafhankelijkeFractie(bestuursperiode, bestuurseenheid) {
    if (!bestuurseenheid) {
      throw `Could not create onafhankelijke fractie`;
    }
    const bestuursorganen =
      await this.bestuursperioden.getRelevantTijdsspecialisaties(
        bestuursperiode
      );

    const onafhankelijkeFractieType = (
      await this.store.query('fractietype', {
        page: { size: 1 },
        'filter[:uri:]': FRACTIETYPE_ONAFHANKELIJK,
      })
    ).at(0);
    const onafhankelijke = this.store.createRecord('fractie', {
      naam: 'Onafhankelijk',
      fractietype: onafhankelijkeFractieType,
      bestuursorganenInTijd: bestuursorganen,
      bestuurseenheid: bestuurseenheid,
    });

    return onafhankelijke;
  }

  // ---------------------  WARNING ---------------------
  // if an onafhankelijke fractie is created, is it not saved yet.
  // save it before use!
  // this is to avoid too many tombstones being created for unused fracties
  // ---------------------  WARNING ----------------
  async getOrCreateOnafhankelijkeFractie(
    person,
    bestuursperiode,
    bestuurseenheid
  ) {
    let onafhankelijkeFractie = await this.findOnafhankelijkeFractieForPerson(
      person,
      bestuursperiode
    );
    if (!onafhankelijkeFractie) {
      onafhankelijkeFractie = await this.createOnafhankelijkeFractie(
        bestuursperiode,
        bestuurseenheid
      );
    }
    return onafhankelijkeFractie;
  }

  async findOnafhankelijkeFractieForPerson(person, bestuursperiode) {
    const onafhankelijkeMembership = await this.store.query('lidmaatschap', {
      'filter[binnen-fractie][fractietype][:uri:]': FRACTIETYPE_ONAFHANKELIJK,
      'filter[lid][is-bestuurlijke-alias-van][:id:]': person.id,
      'filter[lid][bekleedt][bevat-in][heeft-bestuursperiode][:id:]':
        bestuursperiode.id,
    });
    if (!onafhankelijkeMembership.length > 0) {
      return null;
    }
    const onafhankelijkeFractie =
      await onafhankelijkeMembership[0].binnenFractie;
    return onafhankelijkeFractie;
  }

  async isMandatarisFractieOnafhankelijk(mandataris) {
    // assuming that there always be a folded mandataris for the mandataris
    const foldedMandataris = (await fold([mandataris])).at(0);
    const lid = await foldedMandataris.mandataris.heeftLidmaatschap;
    if (!lid) {
      return false;
    }

    const fractie = await lid.binnenFractie;
    if (fractie) {
      const type = await fractie.fractietype;
      return type ? type.isOnafhankelijk : false;
    }

    return false;
  }
}
