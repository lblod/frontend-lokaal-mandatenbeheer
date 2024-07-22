import Service from '@ember/service';

import { service } from '@ember/service';
import { fold } from 'frontend-lmb/utils/fold-mandatarisses';

import { getDraftPublicationStatus } from 'frontend-lmb/utils/get-mandataris-status';
import { MANDATARIS_WAARNEMEND_STATE_ID } from 'frontend-lmb/utils/well-known-ids';
import { MANDATARIS_BEEINDIGD_STATE } from 'frontend-lmb/utils/well-known-uris';

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
    const mandatarisStatus = await this.store.findRecord(
      'mandataris-status-code',
      MANDATARIS_WAARNEMEND_STATE_ID
    );

    const existing = await this.getOverlappingMandate(
      toReplace,
      replacementPerson
    );

    if (existing) {
      existing.status = mandatarisStatus;
      existing.save();

      return existing;
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

  async updateOldLidmaatschap(mandataris) {
    const oldLidmaatschap = await mandataris.heeftLidmaatschap;
    if (!oldLidmaatschap) {
      return;
    }
    let oldTijdsinterval = await oldLidmaatschap.lidGedurende;

    if (!oldTijdsinterval) {
      // old membership instances don't necessarily have a tijdsinterval
      oldTijdsinterval = this.store.createRecord('tijdsinterval', {
        begin: mandataris.start,
        einde: moment(new Date()),
      });
      await oldTijdsinterval.save();
      oldLidmaatschap.lidGedurende = oldTijdsinterval;
      await oldLidmaatschap.save();
    }
    oldTijdsinterval.einde = this.date;

    await oldTijdsinterval.save();
  }

  async createNewProps(mandataris, overwrites) {
    return {
      rangorde: overwrites.rangorde ?? mandataris.rangorde,
      start: overwrites.start ?? mandataris.start,
      einde: overwrites.einde ?? mandataris.einde,
      bekleedt: overwrites.bekleedt ?? (await mandataris.bekleedt),
      isBestuurlijkeAliasVan:
        overwrites.isBestuurlijkeAliasVan ??
        (await mandataris.isBestuurlijkeAliasVan),
      beleidsdomein:
        overwrites.beleidsdomein ?? (await mandataris.beleidsdomein).slice(),
      status: overwrites.status ?? (await mandataris.status),
      publicationStatus:
        overwrites.publicationStatus ?? (await mandataris.publicationStatus),
    };
  }
}
