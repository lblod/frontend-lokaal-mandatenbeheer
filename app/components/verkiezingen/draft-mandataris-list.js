import Component from '@glimmer/component';

import { action } from '@ember/object';
import { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { findIntegerInString } from 'frontend-lmb/utils/find-integer-in-string';
import { A } from '@ember/array';

export default class DraftMandatarisListComponent extends Component {
  @service router;

  @tracked mandatarissen = A([]);
  @tracked isModalOpen = false;
  @tracked mandataris;
  @tracked editBeleidsdomeinen;
  @tracked editRangorde;

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
  openEditRangorde(mandataris) {
    this.mandataris = mandataris;
    this.editRangorde = mandataris.id;
    this.editRangordeValue = mandataris.rangorde;
  }

  @action
  updateRangorde(rangorde) {
    this.mandataris.rangorde = rangorde;
    this.mandataris.save();
  }

  @action
  closeEditRangorde() {
    this.mandataris = null;
    this.editRangorde = null;
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
  setMandatarissen() {
    this.mandatarissen.clear();
    this.mandatarissen.addObjects(this.args.mandatarissen);
  }

  @action
  sortByRangorde() {
    let saved = this.mandatarissen.map((m) => m);
    saved.sort((a, b) => {
      const orderA = a.rangorde;
      const orderB = b.rangorde;

      const rangordeA = findIntegerInString(orderA) ?? 9999;
      const rangordeB = findIntegerInString(orderB) ?? 9999;

      return rangordeA - rangordeB;
    });
    this.mandatarissen.clear();
    this.mandatarissen.pushObjects(saved);
    console.log(saved.map((m) => m.rangorde));
    console.log(this.mandatarissen.map((m) => m.rangorde));
  }
}
