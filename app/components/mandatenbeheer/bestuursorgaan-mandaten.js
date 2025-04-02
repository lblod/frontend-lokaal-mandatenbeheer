import Component from '@glimmer/component';

import { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';

import { task } from 'ember-concurrency';
import { showErrorToast, showSuccessToast } from 'frontend-lmb/utils/toasts';

export default class MandatenbeheerBestuursorgaanMandatenComponent extends Component {
  @service store;
  @service toaster;
  @service router;

  @tracked sort = 'bestuursfunctie.label';
  @tracked creatingNewMandaat = false;
  @tracked selectedBestuursfunctie = null;
  @tracked removingMandaatId = null;

  @tracked editMandaat = null;
  @tracked aantalHouders;
  @tracked errorMessageAantalHouders;
  @tracked showMinMax = false;

  constructor() {
    super(...arguments);
    this.selectedBestuursfunctie = this.args.availableBestuursfuncties[0];
    this.showMinMax = this.args.orderedMandaten.some(
      (obj) => obj.minAantalHouders !== undefined
    );
  }

  createMandaat = task({ drop: true }, async () => {
    const newMandaat = this.store.createRecord('mandaat', {
      bestuursfunctie: this.selectedBestuursfunctie,
      bevatIn: [this.args.bestuursorgaanIT],
    });
    await newMandaat.save();
    this.router.refresh();
    this.creatingNewMandaat = false;
  });

  removeMandaat = task({ drop: true }, async (mandaat) => {
    this.removingMandaatId = mandaat.id;
    const mandatarissen = await this.store.query('mandataris', {
      filter: {
        bekleedt: {
          ':uri:': mandaat.uri,
        },
      },
      page: {
        size: 1,
      },
    });
    if (mandatarissen.length > 0) {
      this.toaster.notify(
        'Het mandaat kon niet worden verwijderd omdat er nog mandatarissen aan gekoppeld zijn!',
        'Error',
        {
          type: 'error',
          icon: 'circle-check',
        }
      );
      return;
    }
    try {
      await mandaat.destroyRecord();
    } catch (error) {
      showErrorToast(
        this.toaster,
        'Het mandaat kon niet verwijderd worden, probeer later opnieuw.'
      );
      return;
    }
    showSuccessToast(this.toaster, 'Het mandaat werd verwijderd.');
    this.router.refresh();
  });

  @action
  createNewMandaat() {
    this.creatingNewMandaat = true;
  }

  @action
  cancelCreateMandaat() {
    this.creatingNewMandaat = false;
  }

  @action
  startEditMandaat(mandaat) {
    this.editMandaat = mandaat;
  }
  @action
  updateAantalHouders(event) {
    if (event && typeof event.preventDefault === 'function') {
      event.preventDefault();
    }
    const aantal = event.target.value;

    if (aantal && !this.isPositiveNumber(aantal)) {
      this.errorMessageAantalHouders = 'Dit moet een positief getal zijn.';
    } else {
      this.errorMessageAantalHouders = null;
    }

    this.aantalHouders = aantal;
  }
  @action
  async saveMandaat() {
    this.editMandaat.aantalHouders = this.aantalHouders;
    await this.editMandaat.save();
    this.aantalHouders = null;
    this.editMandaat = null;
  }
  @action
  cancelEditMandaat() {
    this.aantalHouders = null;
    this.editMandaat = false;
  }

  @action
  isPositiveNumber(value) {
    return value && Number(value) >= 0;
  }

  get disabled() {
    return !this.aantalHouders || !this.isPositiveNumber(this.aantalHouders);
  }

  get toolTipText() {
    if (!this.aantalHouders) {
      return 'Gelieve een aantal houders in te vullen alvorens op te slaan.';
    }
    if (!this.isPositiveNumber(this.aantalHouders)) {
      return 'Gelieve een positief aantal in te vullen alvorens op te slaan.';
    }
    return '';
  }
}
