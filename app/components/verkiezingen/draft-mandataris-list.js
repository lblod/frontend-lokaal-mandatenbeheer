import Component from '@glimmer/component';

import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { orderMandatarissenByRangorde } from 'frontend-lmb/utils/rangorde';
import { JSON_API_TYPE } from 'frontend-lmb/utils/constants';

export default class DraftMandatarisListComponent extends Component {
  @service toaster;

  @tracked isModalOpen = false;
  @tracked mandataris;
  @tracked editBeleidsdomeinen;

  get resortedMandatarissen() {
    if (!this.args.sort || this.args.sort.indexOf('rangorde') < 0) {
      return this.args.mandatarissen;
    }
    const sorted = orderMandatarissenByRangorde([...this.args.mandatarissen]);
    if (this.args.sort.startsWith('-')) {
      return sorted.reverse();
    }
    return sorted;
  }

  @action
  openModal(mandataris) {
    this.mandataris = mandataris;
    this.isModalOpen = true;
  }

  @action
  closeModal() {
    this.isModalOpen = false;
    this.mandataris = null;
  }

  @action
  openEditBeleidsdomeinen(mandataris) {
    this.mandataris = mandataris;
    this.editBeleidsdomeinen = mandataris.id;
    addEventListener('keyup', this.handleKeyDownBeleidsdomeinen);
  }

  @action
  handleKeyDownBeleidsdomeinen(event) {
    if (event.code == 'Escape' || event.code == 'Tab') {
      this.closeEditBeleidsdomeinen();
    }
  }

  @action
  closeEditBeleidsdomeinen() {
    removeEventListener('keyup', this.handleKeyDownBeleidsdomeinen);
    this.mandataris = null;
    this.editBeleidsdomeinen = null;
  }

  @action
  async updateBeleidsdomeinen(selectedBeleidsdomeinen) {
    this.mandataris.beleidsdomein = await selectedBeleidsdomeinen;
    await this.mandataris.save();
  }

  @action
  async updatePerson(person) {
    this.mandataris.isBestuurlijkeAliasVan = person;
    await this.mandataris.save();
    this.closeModal();
  }

  @action
  async removeMandataris(mandataris) {
    const result = await fetch(
      `/mandataris-api/mandatarissen/${mandataris.id}`,
      {
        method: 'DELETE',
        headers: {
          'Content-Type': JSON_API_TYPE,
        },
      }
    );

    if (result.ok) {
      const succesMessage = 'Mandataris succesvol verwijderd.';
      this.toaster.success(succesMessage, 'Succes', { timeOut: 5000 });
    } else {
      const errorMessage =
        'Er ging iets mis bij het verwijderen van de mandataris. Probeer het later opnieuw.';
      this.toaster.error(errorMessage, 'Error');
    }
  }
}
