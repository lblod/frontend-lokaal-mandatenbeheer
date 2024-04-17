import Model, { attr, belongsTo, hasMany } from '@ember-data/model';
import moment from 'moment';
import { MANDATARIS_EDIT_FORM_ID } from 'frontend-lmb/utils/well-known-ids';
import { JSON_API_TYPE } from 'frontend-lmb/utils/constants';

export default class MandatarisModel extends Model {
  @attr rangorde;
  @attr('datetime') start;
  @attr('datetime') einde;
  @attr duplicationReason;
  @attr uri;

  @belongsTo('mandaat', { async: true, inverse: 'bekleedDoor' }) bekleedt;

  @belongsTo('persoon', {
    async: true,
    inverse: 'isAangesteldAls',
  })
  isBestuurlijkeAliasVan;

  @belongsTo('lidmaatschap', {
    async: true,
    inverse: 'lid',
    polymorphic: true,
    as: 'mandataris',
  })
  heeftLidmaatschap;

  @hasMany('mandataris', {
    async: true,
    inverse: null,
  })
  tijdelijkeVervangingen;

  @hasMany('mandataris', {
    async: true,
    inverse: null,
  })
  vervangerVan;

  @hasMany('beleidsdomein-code', {
    async: true,
    inverse: null,
  })
  beleidsdomein;

  @belongsTo('mandataris-status-code', {
    async: true,
    inverse: null,
  })
  status;

  @belongsTo('mandataris-publication-status', {
    async: true,
    inverse: null,
  })
  publicationStatus;

  @belongsTo('mandataris', { async: true, inverse: null }) duplicateOf;

  @hasMany('contact-punt', {
    async: true,
    inverse: 'mandatarissen',
    polymorphic: true,
    as: 'mandataris',
  })
  contactPoints;

  get generatedFromGelinktNotuleren() {
    return (this.generatedFrom || []).some(
      (uri) =>
        uri == 'http://mu.semte.ch/vocabularies/ext/mandatenExtractorService'
    );
  }
  get isActive() {
    if (!this.einde) {
      return true;
    }

    const today = moment(new Date());
    if (this.einde > today) {
      return true;
    }
    return false;
  }

  async save() {
    const creating = !this.id;
    const result = await super.save(...arguments);
    if (creating) {
      await fetch(
        `/form-content/${MANDATARIS_EDIT_FORM_ID}/instances/${this.id}/history`,
        {
          method: 'POST',
          headers: {
            'Content-Type': JSON_API_TYPE,
          },
          body: JSON.stringify({
            description: 'Aangemaakt',
          }),
        }
      );
    }

    return result;
  }
}

export async function getUniqueBestuursorganen(mandataris) {
  let mandate = await mandataris.bekleedt;
  let bestuursorganenInTijd = await mandate.bevatIn;

  let bestuursorganen = new Set();

  for (const bestuursorgaanInTijd of bestuursorganenInTijd) {
    let bestuursorgaan = await bestuursorgaanInTijd.isTijdsspecialisatieVan;
    bestuursorganen.add(bestuursorgaan);
  }

  return Array.from(bestuursorganen);
}

export const getUniqueVervangers = async (mandataris) => {
  const duplicateVervangers = await mandataris.vervangerVan;
  const vervangers = new Map();

  for (let vervanger of duplicateVervangers) {
    const persoon = await vervanger.isBestuurlijkeAliasVan;
    if (!vervangers.has(persoon.id)) {
      vervangers.set(persoon.id, vervanger);
    } else {
      const existingVervanger = vervangers.get(persoon.id);
      const existingEinde = existingVervanger.einde;
      const newEinde = vervanger.einde;

      // Keep the most recent vervanger
      if (!newEinde || (existingEinde && newEinde > existingEinde)) {
        vervangers.set(persoon.id, vervanger);
      }
    }
  }
  return Array.from(vervangers.values());
};
