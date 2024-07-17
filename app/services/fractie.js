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
    // onafhankelijke.save(); TODO: uncomment this

    return onafhankelijke;
  }

  async findOnafhankelijkeFractieForPerson(person) {
    const mandatarissen = await person.isAangesteldAls;
    const onafhankelijkeLidmaatschappen = await this.store.query(
      'lidmaatschap',
      {
        include: 'lid,binnen-fractie,binnen-fractie.fractietype',
        'filter[lid][:uri:]': mandatarissen
          .map((mandataris) => mandataris.uri)
          .join(','),
        'filter[binnen-fractie][fractietype][:uri:]': FRACTIETYPE_ONAFHANKELIJK,
      }
    );

    return onafhankelijkeLidmaatschappen[0]?.binnenFractie ?? null;
  }
}
