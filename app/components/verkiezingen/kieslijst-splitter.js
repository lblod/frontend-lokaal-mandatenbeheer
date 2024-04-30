import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { FRACTIETYPE_SAMENWERKINGSVERBAND } from 'frontend-lmb/utils/well-known-uris';
import { A } from '@ember/array';

export default class KieslijstSplitterComponent extends Component {
  @service store;

  @tracked samenwerkingsVerband;

  @tracked selectedKieslijst;
  @tracked selectedFracties;

  @tracked splitKieslijstModalOpen = false;
  @tracked splitFractie1;
  @tracked splitFractie2;

  @tracked revertKieslijstModalOpen = false;

  @tracked fracties = A([]);

  constructor() {
    super(...arguments);
    this.load();
  }

  get kieslijstSelected() {
    return this.selectedKieslijst != null;
  }

  get fractieSelected() {
    return this.selectedFracties != null;
  }

  get kieslijstCanBeSplit() {
    if (!this.kieslijstSelected) {
      return false;
    }
    return !this.selectedKieslijst.splitted;
  }

  async load() {
    this.samenwerkingsVerband = (
      await this.store.query('fractietype', {
        page: { size: 1 },
        'filter[:uri:]': FRACTIETYPE_SAMENWERKINGSVERBAND,
      })
    ).at(0);
    this.args.kandidatenlijst.forEach((lijst) => {
      lijst.resulterendeFracties.forEach((fractie) => {
        this.fracties.pushObject(fractie);
      });
    });
  }

  @action
  selectKieslijst(lijst) {
    if (!lijst.splitted) {
      this.selectedFracties = null;
      this.selectedKieslijst = lijst;
    }
  }

  @action
  async selectFracties(fractie) {
    this.selectedKieslijst = await fractie
      .get('origineleKandidatenlijst')
      .reload();
    this.selectedFracties = await this.selectedKieslijst
      .get('resulterendeFracties')
      .reload();
  }

  @action
  openSplitKieslijstModal() {
    this.splitKieslijstModalOpen = true;
  }

  @action
  closeSplitKieslijstModal() {
    this.splitKieslijstModalOpen = false;
    this.splitFractie1 = null;
    this.splitFractie2 = null;
  }

  @action
  toggleRevertKieslijstModal() {
    this.revertKieslijstModalOpen = !this.revertKieslijstModalOpen;
  }

  @action
  setValueFractie1(event) {
    this.splitFractie1 = event.target.value;
  }

  @action
  setValueFractie2(event) {
    this.splitFractie2 = event.target.value;
  }

  get hasChanges() {
    return this.splitFractie1 || this.splitFractie2;
  }

  @action
  async splitKieslijst() {
    await this.saveFractie(this.splitFractie1, this.selectedKieslijst);
    await this.saveFractie(this.splitFractie2, this.selectedKieslijst);
    this.closeSplitKieslijstModal();
  }

  @action
  async keepKieslijst() {
    await this.saveFractie(
      this.selectedKieslijst.lijstnaam,
      this.selectedKieslijst
    );
  }

  @action
  async confirmRevertSplitKieslijst() {
    const fracties = await this.selectedKieslijst.get('resulterendeFracties');
    fracties.forEach(async (fractie) => {
      await fracties.removeObject(fractie);
      this.fracties.removeObject(fractie);
      await fractie.destroyRecord();
    });
    await this.selectedKieslijst.save();
    this.toggleRevertKieslijstModal();
  }

  async saveFractie(name, kieslijst) {
    const fractie = this.store.createRecord('fractie', {
      naam: name,
      fractietype: this.samenwerkingsVerband,
      bestuursorganenInTijd: [this.args.bestuursorgaan],
      bestuurseenheid: this.args.bestuurseenheid,
      origineleKandidatenlijst: kieslijst,
    });
    await fractie.save();
    this.fracties.pushObject(fractie);
  }
}
