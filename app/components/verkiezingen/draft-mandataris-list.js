import Component from '@glimmer/component';

import { service } from '@ember/service';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

import { orderMandatarissenByRangorde } from 'frontend-lmb/utils/rangorde';

export default class DraftMandatarisListComponent extends Component {
  @service toaster;
  @service store;

  @tracked isModalOpen = false;
  @tracked mandataris;
  @tracked editBeleidsdomeinen;
  @tracked mandatarissen;

  @tracked isEditing;
  @tracked isEditFormInitialized;
  @tracked mandatarisEdit;

  constructor() {
    super(...arguments);
    this.onInit();
  }

  get resortedMandatarissen() {
    if (!this.args.sort || this.args.sort.indexOf('rangorde') < 0) {
      return this.mandatarissen;
    }
    const sorted = orderMandatarissenByRangorde([...this.mandatarissen]);
    if (this.args.sort.startsWith('-')) {
      return sorted.reverse();
    }
    return sorted;
  }

  @action
  async onInit() {
    const queryParams = {
      sort: this.args.sort,
      page: {
        number: 0,
        size: 9999,
      },
      filter: {
        bekleedt: {
          'bevat-in': {
            id: this.args.bestuursorgaan.id,
          },
        },
      },
      include: [
        'is-bestuurlijke-alias-van',
        'bekleedt.bestuursfunctie',
        'heeft-lidmaatschap.binnen-fractie',
        'status',
        'beleidsdomein',
      ].join(','),
    };

    if (this.args.filter) {
      queryParams['filter']['is-bestuurlijke-alias-van'] = this.args.filter;
    }

    this.mandatarissen = this.store.query('mandataris', queryParams);
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
    mandataris
      .destroyRecord()
      .then(() => {
        const succesMessage = 'Mandataris succesvol verwijderd.';
        this.toaster.success(succesMessage, 'Succes', { timeOut: 5000 });
      })
      .catch(() => {
        const errorMessage =
          'Er ging iets mis bij het verwijderen van de mandataris. Probeer het later opnieuw.';
        this.toaster.error(errorMessage, 'Error');
      });
  }

  @action
  async openEditMandataris(mandataris) {
    this.isEditing = true;
    this.mandatarisEdit = mandataris;
  }

  @action
  saveMandatarisChanges() {
    this.isEditing = false;
    this.isEditFormInitialized = false;
    this.onInit();
  }
}
