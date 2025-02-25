import Component from '@glimmer/component';

import { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';

import { showErrorToast, showSuccessToast } from 'frontend-lmb/utils/toasts';

export default class MandatarissenLinkedModal extends Component {
  @service store;
  @service toaster;
  @service currentSession;

  @tracked doubleMandateTitle = '';
  @tracked doubleMandateText = '';
  @tracked isModalOpen = false;

  @action
  setupModal() {
    if (!this.args.recentUpdate) {
      return;
    }
    if (this.currentSession.group.isOCMW) {
      if (!this.args.create) {
        fetch(
          `/mandataris-api/mandatarissen/${this.args.mandataris}/remove-link-linked-mandataris`,
          { method: 'DELETE' }
        );
      }
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
    const jsonResponse = await response.json();

    if (response.status !== 200) {
      console.error(jsonResponse.message);
      throw jsonResponse.message;
    }

    if (
      (this.args.create &&
        (!jsonResponse.duplicateMandate || jsonResponse.hasDouble)) ||
      ((this.args.correct || this.args.updateState) &&
        (!jsonResponse.duplicateMandate || !jsonResponse.hasDouble))
    ) {
      if (this.args.callback) {
        this.args.callback();
      }
      return;
    }

    this.isModalOpen = true;
    this.setText(jsonResponse.currentMandate, jsonResponse.duplicateMandate);
  }

  setText(currentMandate, duplicateMandate) {
    if (this.args.create) {
      this.doubleMandateTitle = `Aanmaken mandaat ${duplicateMandate}`;
      this.doubleMandateText = `
    U heeft zonet een mandataris met het mandaat ${currentMandate} aangemaakt.
    Normaliter heeft een mandataris met dit mandaat ook een corresponderend mandaat als ${duplicateMandate}.
    Wenst u dit mandaat aan te maken?`;
    } else if (this.args.correct) {
      this.doubleMandateTitle = `Corrigeer fouten mandaat ${duplicateMandate}`;
      this.doubleMandateText = `
    U heeft zonet een mandataris met het mandaat ${currentMandate} gecorrigeerd.
    Deze mandataris heeft ook een corresponderend mandaat ${duplicateMandate}.
    Wenst u de wijzigingen ook door te voeren in dit mandaat?`;
    } else if (this.args.updateState) {
      this.doubleMandateTitle = `Wijzig huidig mandaat ${duplicateMandate}`;
      this.doubleMandateText = `
    U heeft zonet de status van een mandataris met het mandaat ${currentMandate} gewijzigd.
    Deze mandataris heeft ook een corresponderend mandaat ${duplicateMandate}.
    Wenst u de wijzigingen ook door te voeren in dit mandaat?`;
    } else if (this.args.replacement) {
      this.doubleMandateTitle = `Voeg vervanger toe voor mandaat ${duplicateMandate}`;
      this.doubleMandateText = `
    U heeft zonet een vervanger toegevoegd aan een mandataris met het mandaat ${currentMandate}.
    Deze mandataris heeft ook een corresponderend mandaat ${duplicateMandate}.
    Wenst u de vervanger ook toe te voegen in dit mandaat?`;
    }
  }

  @action
  async confirmAction() {
    let response;
    let message;
    if (this.args.create) {
      response = await fetch(
        `/mandataris-api/mandatarissen/${this.args.mandataris}/create-linked-mandataris`,
        { method: 'POST' }
      );
      message =
        'Corresponderend mandaat in het OCMW werd succesvol aangemaakt.';
    } else if (this.args.correct) {
      response = await fetch(
        `/mandataris-api/mandatarissen/${this.args.mandataris}/correct-linked-mandataris`,
        { method: 'PUT' }
      );
      message =
        'Corresponderend mandaat in het OCMW werd succesvol gecorrigeerd.';
    } else if (this.args.updateState) {
      response = await fetch(
        `/mandataris-api/mandatarissen/${this.args.mandataris}/${this.args.newMandataris}/update-state-linked-mandataris`,
        { method: 'PUT' }
      );
      message =
        'Status corresponderend mandaat in het OCMW werd succesvol aangepast.';
    } else if (this.args.replacement) {
      response = await fetch(
        `/mandataris-api/mandatarissen/${this.args.mandataris}/add-linked-replacement`,
        { method: 'PUT' }
      );
      message =
        'Vervanger werd succesvol toegevoegd aan het corresponderend mandaat in het OCMW.';
    }

    const jsonResponse = await response.json();

    if (response.status !== 201 && response.status !== 200) {
      console.error(jsonResponse.message);
      showErrorToast(this.toaster, jsonResponse.message);
    } else {
      showSuccessToast(this.toaster, message);
    }
    this.isModalOpen = false;

    if (this.args.callback) {
      this.args.callback();
    }
  }
}
