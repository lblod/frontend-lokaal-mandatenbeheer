import Service from '@ember/service';

import { service } from '@ember/service';
import { fold } from 'frontend-lmb/utils/fold-mandatarisses';

import { FRACTIETYPE_ONAFHANKELIJK } from 'frontend-lmb/utils/well-known-uris';

export default class FractieService extends Service {
  @service store;

  async createOnafhankelijkeFractie(bestuursorganen, bestuurseenheid) {
    if (!bestuurseenheid) {
      throw `Could not create onafhankelijke fractie`;
    }

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
    //await onafhankelijke.save();

    return onafhankelijke;
  }

  async getOrCreateOnafhankelijkeFractie(
    person,
    bestuursorganen,
    bestuurseenheid
  ) {
    let onafhankelijkeFractie = await this.findOnafhankelijkeFractieForPerson(
      person,
      bestuursorganen
    );
    if (!onafhankelijkeFractie) {
      onafhankelijkeFractie = await this.createOnafhankelijkeFractie(
        bestuursorganen,
        bestuurseenheid
      );
    }
    return onafhankelijkeFractie;
  }

  async findOnafhankelijkeFractieForPerson(person, bestuursorganenInTijd) {
    const onafhankelijkeMembership = await this.store.query('lidmaatschap', {
      'filter[binnen-fractie][fractietype][:uri:]': FRACTIETYPE_ONAFHANKELIJK,
      'filter[lid][is-bestuurlijke-alias-van][:id:]': person.id,
      'filter[lid][bekleedt][bevat-in][:id:]': bestuursorganenInTijd
        .map((b) => b.id)
        .join(','),
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
      return true;
    }

    const fractie = await lid.binnenFractie;
    if (fractie) {
      const type = await fractie.fractietype;
      return type ? type.isOnafhankelijk : false;
    }

    return false;
  }
}
