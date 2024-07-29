import Controller from '@ember/controller';

import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { service } from '@ember/service';

import { task } from 'ember-concurrency';
import { getDraftPublicationStatus } from 'frontend-lmb/utils/get-mandataris-status';
import { getUniqueBestuursorganen } from 'frontend-lmb/models/mandataris';

import { fractieRepository } from 'frontend-lmb/repositories/fractie';
import { mandatarisRepository } from 'frontend-lmb/repositories/mandataris';
import { persoonRepository } from 'frontend-lmb/repositories/persoon';

export default class MandatarissenPersoonMandatenController extends Controller {
  @service router;
  @service store;
  @service('mandataris') mandatarisService;

  queryParams = ['activeOnly'];

  @tracked canBecomeOnafhankelijk;
  @tracked possibelOnafhankelijkeMandatarissen = [];
  @tracked isModalOpen = false;
  @tracked selectedBestuursorgaan = null;
  @tracked activeOnly = true;
  sort = 'is-bestuurlijke-alias-van.achternaam';

  @action
  toggleModal() {
    this.isModalOpen = !this.isModalOpen;
  }

  @action
  closeModal() {
    this.isModalOpen = false;
    this.selectedBestuursorgaan = null;
  }

  @action
  createMandataris() {
    this.toggleModal();
    this.router.transitionTo(
      'organen.orgaan.mandataris.new',
      this.selectedBestuursorgaan.id,
      { queryParams: { person: this.model.persoon.id } }
    );
  }

  @action
  toggleActiveOnly() {
    this.activeOnly = !this.activeOnly;
  }

  checkFracties = task(async (mandatarissen) => {
    this.canBecomeOnafhankelijk = false;
    this.possibelOnafhankelijkeMandatarissen = [];
    for (const mandataris of mandatarissen) {
      const isActive = await mandatarisRepository.isActive(mandataris.id);
      if (!isActive) {
        continue;
      }
      const isOnafhankelijk =
        await fractieRepository.isMandatarisFractieOnafhankelijk(mandataris);
      if (!isOnafhankelijk) {
        this.possibelOnafhankelijkeMandatarissen.push(mandataris);
        continue;
      }
    }

    this.canBecomeOnafhankelijk =
      this.possibelOnafhankelijkeMandatarissen.length >= 1;
  });

  becomeOnafhankelijk = task(async () => {
    if (!this.canBecomeOnafhankelijk) {
      return;
    }

    for (const mandataris of this.possibelOnafhankelijkeMandatarissen) {
      const person = await mandataris.isBestuurlijkeAliasVan;
      const bestuursperiode =
        await mandatarisRepository.getBestuursperiode(mandataris);

      let onafhankelijkeFractieUri =
        await persoonRepository.findOnafhankelijkeFractie(
          person.id,
          bestuursperiode.id
        );

      if (!onafhankelijkeFractieUri) {
        const bestuursorganenInTijd =
          await getUniqueBestuursorganen(mandataris);
        const bestuurseenheid = await bestuursorganenInTijd[0]?.bestuurseenheid;
        onafhankelijkeFractieUri =
          await fractieRepository.createOnafhankelijkeFractie(
            bestuursorganenInTijd.map((boi) => boi.uri),
            bestuurseenheid.uri
          );
      }

      const onafhankelijkeFractie = (
        await this.store.query('fractie', {
          'filter[:uri:]': onafhankelijkeFractieUri,
        })
      ).at(0);

      const dateNow = new Date();
      const newMandatarisProps = await this.mandatarisService.createNewProps(
        mandataris,
        {
          start: dateNow,
          publicationStatus: await getDraftPublicationStatus(this.store),
          fractie: onafhankelijkeFractie,
        }
      );
      const newMandataris = await this.store.createRecord(
        'mandataris',
        newMandatarisProps
      );
      newMandataris.save();

      person.fractie = onafhankelijkeFractie;
      person.save();
      await this.mandatarisService.updateOldLidmaatschap(mandataris);
      await this.mandatarisService.createNewLidmaatschap(
        newMandataris,
        onafhankelijkeFractie
      );

      mandataris.einde = dateNow;
      mandataris.save();
    }

    this.router.refresh();
  });
}
