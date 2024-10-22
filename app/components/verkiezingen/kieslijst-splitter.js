import Component from '@glimmer/component';

import { tracked } from '@glimmer/tracking';
import { service } from '@ember/service';
import { action } from '@ember/object';
import { A } from '@ember/array';

import { FRACTIETYPE_SAMENWERKINGSVERBAND } from 'frontend-lmb/utils/well-known-uris';
import { showErrorToast } from 'frontend-lmb/utils/toasts';

export default class KieslijstSplitterComponent extends Component {
  @service store;
  @service toaster;

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

  get zalOfZullen() {
    if (this.selectedFracties.length == 2) {
      return 'zullen';
    }
    return 'zal';
  }

  @action
  fractieText(extra) {
    if (this.selectedFracties.length == 2) {
      return 'fracties';
    }
    return extra ? `${extra} fractie` : 'fractie';
  }

  get kieslijstSelected() {
    return this.selectedKieslijst != null;
  }

  get fractieSelected() {
    return this.selectedFracties != null;
  }

  get toolTipNoFractieSelected() {
    return 'Er is geen fractie geselecteerd om terug te zetten. Selecteer een fractie in de rechter kolom om terug om te zetten naar de corresponderende kieslijst.';
  }

  get kieslijstCanBeSplit() {
    if (!this.kieslijstSelected) {
      return false;
    }
    return !this.selectedKieslijst.splitted;
  }

  get toolTipCanNotBeSplit() {
    if (!this.kieslijstSelected) {
      return 'Selecteer een kieslijst in de linker kolom om om te zetten naar één of twee fracties.';
    }
    if (this.selectedKieslijst.splitted) {
      return 'De geselecteerde kieslijst is al omgezet naar één of meerdere fracties.';
    }
    return '';
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
    await Promise.all(
      [...fracties].map(async (fractie) => {
        await fracties.removeObject(fractie);
        await fractie.destroyRecord();
        this.fracties.removeObject(fractie);
      })
    ).catch((e) => {
      showErrorToast(
        this.toaster,
        'Er ging iets mis bij het terugzetten van de fracties.'
      );
      console.error(e);
    });
    await this.selectedKieslijst.save();
    this.toggleRevertKieslijstModal();
    this.selectedFracties = null;
  }

  async saveFractie(name, kieslijst) {
    if (!name) {
      return;
    }
    const fractie = this.store.createRecord('fractie', {
      naam: name,
      fractietype: this.samenwerkingsVerband,
      bestuursorganenInTijd: [...this.args.bestuursorgaan],
      bestuurseenheid: this.args.bestuurseenheid,
      origineleKandidatenlijst: kieslijst,
    });
    await fractie.save();
    this.fracties.pushObject(fractie);
  }
}
