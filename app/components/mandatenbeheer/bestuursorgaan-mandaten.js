import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { task } from 'ember-concurrency';

export default class MandatenbeheerFractieSelectorComponent extends Component {
  @service store;
  @service toaster;

  @tracked sort = 'bestuursfunctie.label';
  @tracked creatingNewMandaat = false;
  @tracked availableBestuursfuncties = [];
  @tracked selectedBestuursfunctie = null;
  @tracked removingMandaatId = null;
  @tracked orderedMandaten = [];

  get loadingBestuursfuncties() {
    return this.computeBestuursfuncties.isRunning;
  }

  computeBestuursfuncties = task({ keepLatest: true }, async () => {
    const mandaten = await this.args.mandaten;
    const bestuursFunctiesUsed = await Promise.all(
      mandaten.map((m) => m.bestuursfunctie)
    );
    const allBestuursfuncties = await this.store.query('bestuursfunctie-code', {
      page: {
        size: 200,
      },
    });
    const availableBestuursfuncties = allBestuursfuncties.filter(
      (bf) => !bestuursFunctiesUsed.includes(bf)
    );
    this.availableBestuursfuncties = availableBestuursfuncties.sortBy('label');
    this.selectedBestuursfunctie = this.availableBestuursfuncties.firstObject;
  });

  createMandaat = task({ drop: true }, async () => {
    const newMandaat = this.store.createRecord('mandaat', {
      bestuursfunctie: this.selectedBestuursfunctie,
      bevatIn: [this.args.bestuursorgaanIT],
    });
    await newMandaat.save();
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
    await mandaat.destroyRecord();
    this.toaster.notify('Het mandaat werd verwijderd.', 'Success', {
      type: 'success',
      icon: 'circle-check',
    });
  });

  computeOrderedMandaten = task({ drop: true }, async () => {
    // using a getter on sorted mandaten is not possible because mandaten is a promise array and it
    // is deprecated to call sortby on that directly, sortby is also deprecated it seems...
    const mandaten = await this.args.mandaten;
    this.orderedMandaten = mandaten.slice().sort((a, b) => {
      return a.get('bestuursfunctie.label') > b.get('bestuursfunctie.label')
        ? 1
        : -1;
    });
  });

  initialize = task({ drop: true }, async () => {
    await this.computeBestuursfuncties.perform();
    await this.computeOrderedMandaten.perform();
  });

  @action
  createNewMandaat() {
    this.creatingNewMandaat = true;
  }

  @action
  cancelCreateMandaat() {
    this.creatingNewMandaat = false;
  }
}
