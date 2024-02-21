import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { keepLatestTask, dropTask } from 'ember-concurrency';

export default class MandatenbeheerFractieSelectorComponent extends Component {
  @service store;
  @tracked sort = 'bestuursfunctie.label';
  @tracked creatingNewMandaat = false;
  @tracked availableBestuursfuncties = [];
  @tracked selectedBestuursfunctie = null;

  get mandaten() {
    return this.args.bestuursorgaanIT.bevat;
  }

  get orderedMandaten() {
    return this.mandaten.sortBy('bestuursfunctie.label');
  }

  get loading() {
    return this.mandaten.isPending;
  }

  get loadingBestuursfuncties() {
    return this.computeBestuursfuncties.isRunning;
  }

  @keepLatestTask
  *computeBestuursfuncties() {
    const mandaten = yield this.mandaten;
    const bestuursFunctiesUsed = yield Promise.all(
      mandaten.map((m) => m.bestuursfunctie)
    );
    const allBestuursfuncties = yield this.store.query('bestuursfunctie-code', {
      page: {
        size: 200,
      },
    });
    const availableBestuursfuncties = allBestuursfuncties.filter(
      (bf) => !bestuursFunctiesUsed.includes(bf)
    );
    this.availableBestuursfuncties = availableBestuursfuncties.sortBy('label');
    this.selectedBestuursfunctie = this.availableBestuursfuncties.firstObject;
  }

  @dropTask
  *createMandaat() {
    const newMandaat = this.store.createRecord('mandaat', {
      bestuursfunctie: this.selectedBestuursfunctie,
      bevatIn: [this.args.bestuursorgaanIT],
    });
    yield newMandaat.save();
    this.creatingNewMandaat = false;
  }

  @action
  hideMandaat() {
    // TODO
  }

  @action
  confirmCreateMandaat() {
    this.createMandaat.perform();
  }

  @action
  createNewMandaat() {
    this.creatingNewMandaat = true;
  }

  @action
  cancelCreateMandaat() {
    this.creatingNewMandaat = false;
  }

  @action
  initialize() {
    this.computeBestuursfuncties.perform();
  }
}
