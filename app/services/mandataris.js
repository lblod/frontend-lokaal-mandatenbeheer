import Service from '@ember/service';

import { service } from '@ember/service';
import { fold } from 'frontend-lmb/utils/fold-mandatarisses';

import { getDraftPublicationStatus } from 'frontend-lmb/utils/get-mandataris-status';
import { MANDATARIS_WAARNEMEND_STATE_ID } from 'frontend-lmb/utils/well-known-ids';
import { MANDATARIS_BEEINDIGD_STATE } from 'frontend-lmb/utils/well-known-uris';

import moment from 'moment';

export default class MandatarisService extends Service {
  @service store;
  @service fractieApi;

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
    newMandatarisState
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
    return newMandataris;
  }

  async createNewLidmaatschap(newMandataris, fractie) {
    if (!fractie) {
      return;
    }

    const newLidmaatschap = this.store.createRecord('lidmaatschap', {
      binnenFractie: fractie,
      lid: newMandataris,
    });
    await newLidmaatschap.save();
  }

  async destroyLidmaatschap(mandataris) {
    const lidmaatschap = await mandataris.heeftLidmaatschap;
    lidmaatschap.destroyRecord();
    mandataris.heeftLidmaatschap = null;
    await mandataris.save();
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
    return status && status.uri !== MANDATARIS_BEEINDIGD_STATE;
  }

  async removeDanglingFractiesInPeriod(mandatarisId) {
    const mandataris = await this.store.findRecord('mandataris', mandatarisId);
    const mandaat = await mandataris.bekleedt;
    const bestuursorganenInTijd = await mandaat.bevatIn;
    if (bestuursorganenInTijd.length >= 1) {
      const first = bestuursorganenInTijd.at(0);
      const periode = await first.heeftBestuursperiode;
      await this.fractieApi.removeFractieWhenNoLidmaatschap(periode.id);
    }
  }
}
