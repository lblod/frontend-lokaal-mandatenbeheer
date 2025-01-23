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
  @attr('datetime') effectiefAt;

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

  @belongsTo('rechtsgrond', {
    async: true,
    inverse: 'bekrachtigtAanstellingVan',
    polymorphic: true,
  })
  aanstellingBekrachtigdDoor;

  @belongsTo('rechtsgrond', {
    async: true,
    inverse: 'bekrachtigtOntslagVan',
    polymorphic: true,
  })
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

  get isVoorzitter() {
    return this.bekleedt.get('isVoorzitter');
  }

  get besluitUri() {
    // eslint-disable-next-line no-async-promise-executor
    return new Promise(async (resolve) => {
      if (await this.ontslagBekrachtigdDoor) {
        resolve(this.ontslagBekrachtigdDoor.get('gepubliceerdVanuit'));
      }
      if (await this.aanstellingBekrachtigdDoor) {
        resolve(this.aanstellingBekrachtigdDoor.get('gepubliceerdVanuit'));
      }

      resolve(null);
    });
  }

  async getUnique(people) {
    const vervangers = new Map();
    const allPeople = (await people).slice();

    for (let vervanger of allPeople) {
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
    if (!this.isDeleted) {
      this.modified = new Date();
    }
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
