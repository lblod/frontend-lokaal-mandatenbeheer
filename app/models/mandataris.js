import Model, { attr, belongsTo, hasMany } from '@ember-data/model';

import moment from 'moment';
import { MANDATARIS_EDIT_FORM_ID } from 'frontend-lmb/utils/well-known-ids';
import { JSON_API_TYPE } from 'frontend-lmb/utils/constants';
import { endOfDay, startOfDay } from 'frontend-lmb/utils/date-manipulation';
import {
  MANDAAT_BURGEMEESTER_CODE,
  MANDATARIS_DRAFT_PUBLICATION_STATE,
  MANDATARIS_NIET_BEKRACHTIGD_PUBLICATION_STATE,
} from 'frontend-lmb/utils/well-known-uris';

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

  get isApprovedForDeletion() {
    const approvedStatussen = [
      MANDATARIS_DRAFT_PUBLICATION_STATE,
      MANDATARIS_NIET_BEKRACHTIGD_PUBLICATION_STATE,
    ];

    return approvedStatussen.includes(this.publicationStatus?.get('uri'));
  }

  // Why is this here?
  get displayEinde() {
    return this.einde;
  }

  get mandatarisEndDate() {
    if (!this.einde) {
      return null;
    }

    return endOfDay(this.einde);
  }

  get mandatarisStartDate() {
    if (!this.start) {
      return null;
    }

    return startOfDay(this.start);
  }

  get isActive() {
    if (!this.einde) {
      return true;
    }

    const today = moment(new Date());
    if (this.mandatarisEndDate > today) {
      return true;
    }
    return false;
  }

  get isCurrentlyActive() {
    const now = moment();
    const start = moment(this.mandatarisStartDate);
    const end = this.einde
      ? moment(this.mandatarisEndDate)
      : moment('3000-01-01');
    return now.isBetween(start, end);
  }

  isActiveAt(date) {
    if (!this.einde) {
      return moment(this.mandatarisStartDate).isSameOrBefore(date);
    }
    return (
      moment(this.mandatarisStartDate).isSameOrBefore(date) &&
      moment(this.mandatarisEndDate).isAfter(date)
    );
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

  get isStrictBurgemeester() {
    return (
      this.bekleedt.get('bestuursfunctie').get('uri') ===
      MANDAAT_BURGEMEESTER_CODE
    );
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
    if (this.start) {
      this.start = this.mandatarisStartDate;
    }
    if (this.einde) {
      this.einde = this.mandatarisEndDate;
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

  get validationText() {
    // eslint-disable-next-line ember/no-get, ember/classic-decorator-no-classic-methods
    const naam = this.get('isBestuurlijkeAliasVan.naam');
    // eslint-disable-next-line ember/no-get, ember/classic-decorator-no-classic-methods
    const bestuursfunctie = this.get('bekleedt.bestuursfunctie.label');
    const from = moment(this.start).format('DD-MM-YYYY');
    const to = this.einde
      ? moment(this.einde).format('DD-MM-YYYY')
      : 'onbepaald';
    return `${naam} [${bestuursfunctie}] (${from} - ${to})`;
  }

  // custom delete function so we can tell the mandataris service to also delete the
  // linked mandataris if any and to remove extra links toward the mandataris that may
  // otherwise disrupt operations
  async deleteMandataris(withLinked) {
    await fetch(`/mandatarissen/${this.id}?withLinked=${withLinked}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': JSON_API_TYPE,
      },
    });
    this.deleteRecord();
    // give resources cache some time
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }
}
