import Component from '@glimmer/component';
import { dropTask } from 'ember-concurrency';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';
import { showErrorToast, showSuccessToast } from 'frontend-lmb/utils/toasts';

export default class MandatarissenUpdateState extends Component {
  @tracked newStatus = null;
  @tracked date = null;
  @tracked selectedBeleidsdomeinen = [];
  @tracked selectedFractie = null;
  @tracked bestuursorganenForFractie = [];
  @tracked rangorde = null;

  @service mandatarisStatus;
  @service store;
  @service toaster;

  constructor() {
    super(...arguments);
    this.load.perform();
  }

  get loading() {
    return this.load.isRunning;
  }

  @dropTask
  *load() {
    this.newStatus = this.args.mandataris.status;
    this.date = new Date();
    this.selectedBeleidsdomeinen = this.args.mandataris.beleidsdomein.slice();
    this.rangorde = this.args.mandataris.rangorde;
    this.selectedFractie = yield (yield this.args.mandataris.heeftLidmaatschap)
      ?.binnenFractie;
    this.bestuursorganenForFractie = (yield (yield this.args.mandataris
      .bekleedt).bevatIn).slice();
  }

  get statusOptions() {
    return this.mandatarisStatus.statuses;
  }

  get currentStatus() {
    if (!this.args.mandataris.einde) {
      return this.args.mandataris.status;
    }
    if (this.args.mandataris.einde.getTime() < new Date().getTime()) {
      return this.mandatarisStatus.endedState;
    }
    return this.args.mandataris.status;
  }

  get isTerminatingMandate() {
    return this.newStatus === this.mandatarisStatus.endedState;
  }

  get validDate() {
    if (!this.date) {
      return false;
    }
    if (!this.args.mandataris.start) {
      return true;
    }
    return this.date.getTime() >= this.args.mandataris.start.getTime();
  }

  get hasDifferenceInBeleidsdomeinen() {
    if (
      this.selectedBeleidsdomeinen.length !==
      this.args.mandataris.beleidsdomein.length
    ) {
      return true;
    }

    // if the length is the same, a difference requires a new item to have been added

    const oldIds = new Set();

    this.args.mandataris.beleidsdomein.forEach((beleidsdomein) => {
      oldIds.add(beleidsdomein.id);
    });
    for (let i = 0; i < this.selectedBeleidsdomeinen.length; i++) {
      if (!oldIds.has(this.selectedBeleidsdomeinen[i].id)) {
        return true;
      }
    }
    return false;
  }

  get hasDifference() {
    return (
      this.newStatus?.id !== this.args.mandataris.status?.id ||
      this.date.getTime() !== this.args.mandataris.einde?.getTime() ||
      this.selectedFractie?.id !==
        this.args.mandataris.get('heeftLidmaatschap.binnenFractie.id') ||
      this.hasDifferenceInBeleidsdomeinen ||
      this.rangorde !== this.args.mandataris.rangorde
    );
  }

  get disabled() {
    return (
      this.loading ||
      !this.newStatus ||
      !this.date ||
      !this.validDate ||
      !this.hasDifference
    );
  }

  get showRangorde() {
    const roleName = this.args.mandataris.get('bekleedt.bestuursfunctie.label');
    return roleName && roleName.toLowerCase().indexOf('schepen') >= 0;
  }

  get rangordePlaceholder() {
    const mandaatName = (
      this.args.mandataris.get('bekleedt.bestuursfunctie.label') || 'schepen'
    ).toLowerCase();
    return `Eerste ${mandaatName}`;
  }

  async changeMandatarisState() {
    await this.updateOldLidmaatschap();

    const endDate = this.args.mandataris.einde;
    const newMandataris = this.store.createRecord('mandataris', {
      bekleedt: this.args.mandataris.bekleedt,
      beleidsdomein: this.selectedBeleidsdomeinen,
      isBestuurlijkeAliasVan: this.args.mandataris.isBestuurlijkeAliasVan,
      rangorde: this.rangorde,
      isDraft: true,
      start: this.date,
      status: this.newStatus,
      einde: endDate,
    });
    this.args.mandataris.einde = this.date;
    await Promise.all([newMandataris.save(), this.args.mandataris.save()]);

    await this.createNewLidmaatschap(newMandataris);

    return newMandataris;
  }

  async updateOldLidmaatschap() {
    const oldLidmaatschap = await this.args.mandataris.heeftLidmaatschap;
    if (!oldLidmaatschap) {
      return;
    }
    let oldTijdsinterval = await oldLidmaatschap.lidGedurende;

    if (!oldTijdsinterval) {
      // old membership instances don't necessarily have a tijdsinterval
      oldTijdsinterval = this.store.createRecord('tijdsinterval', {
        begin: this.args.mandataris.start,
        einde: this.date,
      });
      await oldTijdsinterval.save();
      oldLidmaatschap.lidGedurende = oldTijdsinterval;
      await oldLidmaatschap.save();
    }
    oldTijdsinterval.einde = this.date;

    await oldTijdsinterval.save();
  }

  async createNewLidmaatschap(newMandataris) {
    if (!this.selectedFractie) {
      return;
    }
    const endDate = this.args.mandataris.einde;
    const newTijdsinterval = this.store.createRecord('tijdsinterval', {
      begin: this.date,
      einde: endDate,
    });

    await newTijdsinterval.save();

    const newLidmaatschap = this.store.createRecord('lidmaatschap', {
      binnenFractie: this.selectedFractie,
      lid: newMandataris,
      lidGedurende: newTijdsinterval,
    });
    await newLidmaatschap.save();
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

  @action updateBeleidsdomeinen(selectedBeleidsdomeinen) {
    this.selectedBeleidsdomeinen = selectedBeleidsdomeinen;
  }

  @action updateFractie(newFractie) {
    this.selectedFractie = newFractie;
  }
}
