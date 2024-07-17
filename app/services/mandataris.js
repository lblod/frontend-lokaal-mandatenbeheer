import Service from '@ember/service';

import { service } from '@ember/service';
import { fold } from 'frontend-lmb/utils/fold-mandatarisses';

import { getDraftPublicationStatus } from 'frontend-lmb/utils/get-mandataris-status';
import { MANDATARIS_WAARNEMEND_STATE_ID } from 'frontend-lmb/utils/well-known-ids';
import {
  MANDATARIS_BEEINDIGD_STATE,
  MANDATARIS_VERHINDERD_STATE,
} from 'frontend-lmb/utils/well-known-uris';

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
      mandatarisStatus = await this.store.findRecord(
        'mandataris-status-code',
        MANDATARIS_WAARNEMEND_STATE_ID
      );
    }

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

  async createNewFrom(mandataris, newMandatarisProps) {
    const newMandataris = this.store.createRecord('mandataris', {
      rangorde: newMandatarisProps.rangorde ?? mandataris.rangorde,
      start: newMandatarisProps.start ?? mandataris.start,
      einde: newMandatarisProps.einde ?? mandataris.einde,
      bekleedt: newMandatarisProps.bekleedt ?? (await mandataris.bekleedt),
      isBestuurlijkeAliasVan:
        newMandatarisProps.isBestuurlijkeAliasVan ??
        (await mandataris.isBestuurlijkeAliasVan),
      beleidsdomein:
        newMandatarisProps.beleidsdomein ?? (await mandataris.beleidsdomein),
      status: newMandatarisProps.status ?? (await mandataris.status),
      publicationStatus:
        newMandatarisProps.publicationStatus ??
        (await mandataris.publicationStatus),
    });
    await newMandataris.save();
    await this.createNewLidmaatschap(
      newMandataris,
      newMandatarisProps.fractie ?? mandataris.fractie
    );
  }

  async isMandatarisActive(mandataris) {
    // assuming that there always be a folded mandataris for the mandataris
    const foldedMandataris = (await fold([mandataris])).at(0);
    const now = moment();
    const todayIsInBetweenPeriod =
      moment(foldedMandataris.foldedStart).isBefore(now) &&
      (!foldedMandataris.foldedEnd ||
        moment(foldedMandataris.foldedEnd).isAfter(now));

    if (!todayIsInBetweenPeriod) {
      return false;
    }

    const status = await foldedMandataris.mandataris.status;
    return (
      status &&
      status.uri !== MANDATARIS_VERHINDERD_STATE &&
      status.uri !== MANDATARIS_BEEINDIGD_STATE
    );
  }
}
