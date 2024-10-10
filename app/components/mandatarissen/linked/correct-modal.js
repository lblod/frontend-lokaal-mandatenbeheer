import Component from '@glimmer/component';

import { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';

import { showErrorToast, showSuccessToast } from 'frontend-lmb/utils/toasts';

export default class MandatarissenLinkedCorrectModal extends Component {
  @service store;
  @service toaster;
  @service currentSession;

  @tracked doubleMandateTitle = '';
  @tracked doubleMandateText = '';
  @tracked isModalOpen = false;

  @action
  checkIfMandateAlreadyExists() {
    if (this.currentSession.group.isOCMW) {
      return;
    }
    if (!this.args.recentUpdate) {
      return;
    }
    this.checkDoubleMandataris();
  }

  @action
  closeModal() {
    this.isModalOpen = false;
    if (this.args.callback) {
      this.args.callback();
    }
  }

  @action
  async checkDoubleMandataris() {
    const response = await fetch(
      `/mandataris-api/mandatarissen/${this.args.mandataris}/check-possible-double`
    );
    const jsonReponse = await response.json();

    if (response.status !== 200) {
      console.error(jsonReponse.message);
      throw jsonReponse.message;
    }

    if (!jsonReponse.duplicateMandate || !jsonReponse.hasDouble) {
      if (this.args.callback) {
        this.args.callback();
      }
      return;
    }

    this.isModalOpen = true;
    const currentMandate = jsonReponse.currentMandate;
    const duplicateMandate = jsonReponse.duplicateMandate;
    this.doubleMandateTitle = `Corrigeer fouten mandaat ${duplicateMandate}`;
    this.doubleMandateText = `
    U heeft zonet een mandataris met het mandaat ${currentMandate} gecorrigeerd.
    Deze mandataris heeft ook een corresponderend mandaat ${duplicateMandate}.
    Wenst u de wijzigingen ook door te voeren in dit mandaat?`;
  }

  @action
  async correctDoubleMandataris() {
    const response = await fetch(
      `/mandataris-api/mandatarissen/${this.args.mandataris}/correct-linked-mandataris`,
      { method: 'PUT' }
    );
    const jsonReponse = await response.json();

    if (response.status !== 200) {
      console.error(jsonReponse.message);
      showErrorToast(this.toaster, jsonReponse.message);
    }
    showSuccessToast(this.toaster, `Mandataris werd succesvol gecorrigeerd.`);
    this.isModalOpen = false;

    if (this.args.callback) {
      this.args.callback();
    }
  }
}
