import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { FRACTIETYPE_SAMENWERKINGSVERBAND } from 'frontend-lmb/utils/well-known-uris';

export default class KieslijstSplitterComponent extends Component {
  @service store;

  @tracked samenwerkingsVerband;

  @tracked selectedKieslijst;
  @tracked selectedFractie;
  @tracked splitKieslijstModalOpen = false;
  @tracked splitFractie1;
  @tracked splitFractie2;

  constructor() {
    super(...arguments);
    this.load();
  }

  get kieslijstSelected() {
    return this.selectedKieslijst != null;
  }

  get fractieSelected() {
    return this.selectedFractie != null;
  }

  get kieslijstCanBeSplit() {
    if (!this.kieslijstSelected) {
      return false;
    }
    const fracties = this.selectedKieslijst.get('resulterendeFracties');
    return !fracties || fracties.length == 0;
  }

  async load() {
    this.samenwerkingsVerband = (
      await this.store.query('fractietype', {
        page: { size: 1 },
        'filter[:uri:]': FRACTIETYPE_SAMENWERKINGSVERBAND,
      })
    ).at(0);
  }

  @action
  selectKieslijst(lijst) {
    this.selectedFractie = null;
    this.selectedKieslijst = lijst;
  }

  @action
  selectFractie(fractie) {
    this.selectedKieslijst = null;
    this.selectedFractie = fractie;
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
  async revertSplitKieslijst() {
    const kieslijst = await this.selectedFractie.get(
      'origineleKandidatenlijst'
    );
    const fracties = await kieslijst.get('resulterendeFracties');
    fracties.forEach(async (fractie) => {
      await fracties.removeObject(fractie);
      await fractie.destroyRecord();
    });
    await kieslijst.save();
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
  }
}
