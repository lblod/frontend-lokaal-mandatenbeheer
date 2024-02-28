import Component from '@glimmer/component';
import { dropTask } from 'ember-concurrency';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';
import { showErrorToast, showSuccessToast } from 'frontend-lmb/utils/toasts';

export default class MandatarissenUpdateState extends Component {
  @tracked newStatus = null;
  @tracked date = new Date();

  @service mandatarisStatus;
  @service store;
  @service toaster;

  constructor() {
    super(...arguments);
    this.newStatus = this.mandatarisStatus.endedState;
  }

  get statusOptions() {
    return this.mandatarisStatus.statuses
      .filter((status) => status.id !== this.currentStatus?.id)
      .sort((a, b) => {
        return a.label.localeCompare(b.label);
      });
  }

  get currentStatus() {
    if (this.args.mandataris.einde.getTime() < new Date().getTime()) {
      return this.mandatarisStatus.endedState;
    }
    return this.args.mandataris.status;
  }

  get validDate() {
    return (
      this.date && this.date.getTime() >= this.args.mandataris.start.getTime()
    );
  }

  get disabled() {
    return this.loading || !this.newStatus || !this.date || !this.validDate;
  }

  async changeMandatarisState() {
    const newMandataris = this.store.createRecord('mandataris', {
      bekleedt: await this.args.mandataris.bekleedt,
      lidmaatschap: await this.args.mandataris.lidmaatschap,
      beleidsdomein: (await this.args.mandataris.beleidsdomein) || [],
      isBestuurlijkeAliasVan: await this.args.mandataris.isBestuurlijkeAliasVan,
      start: this.date,
      status: this.newStatus,
      einde: this.args.mandataris.einde,
    });
    this.args.mandataris.einde = this.date;
    await Promise.all([newMandataris.save(), this.args.mandataris.save()]);
    return newMandataris;
  }

  endMandataris() {
    this.args.mandataris.einde = this.date;
    return this.args.mandataris.save();
  }

  onStateChanged(newMandataris) {
    if (this.args.onStateChanged) {
      this.args.onStateChanged(newMandataris);
    }
  }

  @dropTask
  *updateState() {
    let promise;
    if (this.newStatus === this.mandatarisStatus.endedState) {
      promise = this.endMandataris();
    } else {
      promise = this.changeMandatarisState();
    }

    yield promise
      .then((newMandataris) => {
        showSuccessToast(
          this.toaster,
          'Mandataris status werd succesvol aangepast.'
        );
        this.onStateChanged(newMandataris);
      })
      .catch(() => {
        showErrorToast(
          this.toaster,
          'Er ging iets mis bij het aanpassen van de mandataris status.'
        );
        this.onStateChanged(this.args.mandataris);
      });
  }

  @action
  updateDate(date) {
    this.date = new Date(date);
  }

  @action
  updateNewStatus(status) {
    this.newStatus = status;
  }
}
