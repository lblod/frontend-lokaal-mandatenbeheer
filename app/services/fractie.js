import Service from '@ember/service';

import { service } from '@ember/service';

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
    onafhankelijke.save();

    return onafhankelijke;
  }

  async findOnafhankelijkeFractieForPerson(person) {
    const mandatarissen = await person.isAangesteldAls;
    for (const mandataris of mandatarissen) {
      const lid = await mandataris.heeftLidmaatschap;
      if (!lid) {
        continue;
      }

      const fractie = await lid.binnenFractie;
      const type = await fractie.fractietype;
      if (type.isOnafhankelijk) {
        return fractie;
      }
    }

    return null;
  }
}
