import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { FRACTIETYPE_SAMENWERKINGSVERBAND } from 'frontend-lmb/utils/well-known-uris';

export default class KieslijstSplitterComponent extends Component {
  @service store;
  @service router;

  @tracked samenwerkingsVerband;

  @tracked selectedKieslijst;
  @tracked selectedFractie;

  constructor() {
    super(...arguments);
    this.load();
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
  tmp() {
    console.log('Temporary button action');
  }

  @action
  async behoudKieslijst() {
    const fractie = this.store.createRecord('fractie', {
      naam: this.selectedKieslijst.lijstnaam,
      fractietype: this.samenwerkingsVerband,
      bestuursorganenInTijd: [this.args.bestuursorgaan],
      bestuurseenheid: this.args.bestuurseenheid,
      origineleKandidatenlijst: this.selectedKieslijst,
    });
    await fractie.save();
    this.router.refresh();
  }
}
