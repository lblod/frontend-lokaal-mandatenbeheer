import Component from '@glimmer/component';

import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { service } from '@ember/service';

import { MANDATARIS_BEKRACHTIGD_PUBLICATION_STATE } from 'frontend-lmb/utils/well-known-uris';

import { task } from 'ember-concurrency';
import { getDraftPublicationStatus } from 'frontend-lmb/utils/get-mandataris-status';

export default class MandatarisCardComponent extends Component {
  @tracked editingStatus = false;

  @service store;
  @service('mandataris') mandatarisService;

  get status() {
    return this.args.mandataris.status.get('label');
  }

  get isBekrachtigd() {
    const statusId = this.args.mandataris.publicationStatus?.get('uri');
    return !statusId || statusId === MANDATARIS_BEKRACHTIGD_PUBLICATION_STATE;
  }

  get fractie() {
    return this.args.mandataris.heeftLidmaatschap.get('binnenFractie')
      ? this.args.mandataris.heeftLidmaatschap.get('binnenFractie').get('naam')
      : '';
  }

  get persoon() {
    return this.args.mandataris.isBestuurlijkeAliasVan;
  }

  get vervangersDoor() {
    return this.args.mandataris.uniqueVervangersDoor;
  }

  get vervangersVan() {
    return this.args.mandataris.uniqueVervangersVan;
  }

  get skinForStatusPill() {
    if (this.status && this.status == 'Effectief') {
      return 'success';
    }

    return 'default';
  }

  @action
  editStatus() {
    this.editingStatus = true;
  }

  @action
  stopEditingStatus() {
    this.editingStatus = false;
  }

  addReplacement = task(async (replacement) => {
    const newMandatarisProps = await this.mandatarisService.createNewProps(
      this.args.mandataris,
      {
        start: new Date(),
        publicationStatus: await getDraftPublicationStatus(this.store),
      }
    );
    const lidmaatschap = await this.args.mandataris.heeftLidmaatschap;
    const replacementMandataris =
      await this.mandatarisService.getOrCreateReplacement(
        this.args.mandataris,
        replacement,
        newMandatarisProps,
        await lidmaatschap.binnenFractie
      );
    this.args.mandataris.tijdelijkeVervangingen = [replacementMandataris];
  });
}
