import Component from '@glimmer/component';

import { action } from '@ember/object';
import { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';

import { showErrorToast, showSuccessToast } from 'frontend-lmb/utils/toasts';

export default class MandatarissenDeleteModal extends Component {
  @service router;
  @service toaster;

  @tracked isDeleting;

  async realDelete(withLinked) {
    this.isDeleting = true;
    try {
      const mandaat = await this.args.mandataris.bekleedt;
      const orgT = await mandaat.bevatIn;
      const org = await orgT[0].isTijdsspecialisatieVan;
      await this.args.mandataris.deleteMandataris(withLinked);
      showSuccessToast(
        this.toaster,
        'Mandataris succesvol verwijderd',
        'Mandataris'
      );
      this.router.transitionTo('organen.orgaan.mandatarissen', org.id);
    } catch (error) {
      showErrorToast(
        this.toaster,
        'De mandataris kon niet verwijderd worden, probeer later opnieuw.',
        'Mandataris'
      );
      console.log(error);
    }
    this.isDeleting = false;
    this.args.onClose();
  }
  @action
  delete() {
    this.realDelete(false);
  }
  @action
  deleteWithLinked() {
    this.realDelete(true);
  }

  get isClosable() {
    return !!this.args.onClose;
  }

  get specificsLinkedMandataris() {
    const linked = this.args.linkedMandataris;
    if (!linked) {
      return '';
    }
    return `(${linked.duplicateMandate})`;
  }
}
