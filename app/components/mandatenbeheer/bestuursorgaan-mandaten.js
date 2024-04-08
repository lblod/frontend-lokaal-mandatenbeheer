import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { task } from 'ember-concurrency';

export default class MandatenbeheerFractieSelectorComponent extends Component {
  @service store;
  @service toaster;
  @service router;

  @tracked sort = 'bestuursfunctie.label';
  @tracked creatingNewMandaat = false;
  @tracked selectedBestuursfunctie = null;
  @tracked removingMandaatId = null;

  constructor() {
    super(...arguments);
    this.selectedBestuursfunctie =
      this.args.availableBestuursfuncties.firstObject;
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
    await mandaat.destroyRecord();
    this.toaster.notify('Het mandaat werd verwijderd.', 'Success', {
      type: 'success',
      icon: 'circle-check',
    });
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
}
