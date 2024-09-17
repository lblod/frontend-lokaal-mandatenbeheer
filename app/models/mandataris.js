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
  @attr('string') linkToBesluit;
  @attr('datetime') modified;

  @belongsTo('mandaat', { async: true, inverse: 'bekleedDoor' })
  bekleedt;

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

  @belongsTo('mandataris-publication-status-code', {
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

  @belongsTo('rechtsgrond', { async: true, inverse: null, polymorphic: true })
  aanstellingBekrachtigdDoor;
  @belongsTo('rechtsgrond', { async: true, inverse: null, polymorphic: true })
  ontslagBekrachtigdDoor;

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

  get uniqueVervangersDoor() {
    return this.getUnique(this.tijdelijkeVervangingen);
  }

  get uniqueVervangersVan() {
    return this.getUnique(this.vervangerVan);
  }

  async getUnique(people) {
    const vervangers = new Map();

    for (let vervanger of people.slice()) {
      const persoon = await vervanger.isBestuurlijkeAliasVan;
      if (!vervangers.has(persoon.id)) {
        vervangers.set(persoon.id, vervanger);
      } else {
        const existingVervanger = vervangers.get(persoon.id);
        const existingEinde = existingVervanger.einde;
        const newEinde = vervanger.einde;

        // Keep the most recent
        if (!newEinde || (existingEinde && newEinde > existingEinde)) {
          vervangers.set(persoon.id, vervanger);
        }
      }
    }
    return Array.from(vervangers.values());
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

export async function getLinkToDecision(mandataris) {
  const aanstelling = await mandataris.aanstellingBekrachtigdDoor;
  if (aanstelling) {
    return aanstelling;
  }

  const ontslag = await mandataris.ontslagBekrachtigdDoor;
  if (ontslag) {
    return ontslag;
  }

  return mandataris.linkToBesluit;
}
