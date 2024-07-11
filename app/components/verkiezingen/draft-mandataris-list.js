import Component from '@glimmer/component';

import { service } from '@ember/service';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

import { orderMandatarissenByRangorde } from 'frontend-lmb/utils/rangorde';

export default class DraftMandatarisListComponent extends Component {
  @service toaster;
  @service store;

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
