import Service from '@ember/service';

import { service } from '@ember/service';

import { getDraftPublicationStatus } from 'frontend-lmb/utils/get-mandataris-status';
import { MANDATARIS_WAARNEMEND_STATE_ID } from 'frontend-lmb/utils/well-known-ids';

import moment from 'moment';

export default class MandatarisService extends Service {
  @service store;

  async getOverlappingMandate(mandataris, person, endDate = null) {
    const mandate = await mandataris.bekleedt;
    const mandatarisses = await this.store.query('mandataris', {
      filter: {
        bekleedt: {
          id: mandate.id,
        },
        'is-bestuurlijke-alias-van': {
          id: person.id,
        },
      },
    });

    const toCheck = mandatarisses.slice();
    let current;
    const start = moment(mandataris.start);
    const end = moment(endDate || mandataris.einde);
    while ((current = toCheck.pop())) {
      if (
        (!start || start.isSameOrBefore(current.einde)) &&
        (!end || end.isSameOrAfter(current.start))
      ) {
        return current;
      }
    }
    return null;
  }

  async getOrCreateReplacement(
    toReplace,
    replacementPerson,
    newMandatarisState,
    newFractie
  ) {
    let mandatarisStatus = toReplace.status;

    const mandaat = await toReplace.bekleedt;
    const existing = await this.getOverlappingMandate(
      toReplace,
      replacementPerson
    );

    if (mandaat && mandaat.isBurgemeester) {
      mandatarisStatus = this.store.findRecord(
        'mandataris-status-code',
        MANDATARIS_WAARNEMEND_STATE_ID
      );
    }

    if (existing) {
      const mandataris = await this.store.findRecord('mandataris', existing.id);
      mandataris.status = mandatarisStatus;
      mandataris.save();
      return mandataris;
    }

    const newMandataris = this.store.createRecord('mandataris', {
      rangorde: newMandatarisState.rangorde,
      start: newMandatarisState.start,
      einde: newMandatarisState.einde,
      bekleedt: toReplace.bekleedt,
      isBestuurlijkeAliasVan: replacementPerson,
      beleidsdomein: await newMandatarisState.beleidsdomein,
      status: mandatarisStatus,
      publicationStatus: await getDraftPublicationStatus(this.store),
    });
    await newMandataris.save();

    await this.createNewLidmaatschap(newMandataris, newFractie);

    return newMandataris;
  }

  async createNewLidmaatschap(newMandataris, fractie) {
    if (!fractie) {
      return;
    }
    const newTijdsinterval = this.store.createRecord('tijdsinterval', {
      begin: newMandataris.start,
      einde: newMandataris.einde,
    });

    await newTijdsinterval.save();

    const newLidmaatschap = this.store.createRecord('lidmaatschap', {
      binnenFractie: fractie,
      lid: newMandataris,
      lidGedurende: newTijdsinterval,
    });
    await newLidmaatschap.save();
  }
}
