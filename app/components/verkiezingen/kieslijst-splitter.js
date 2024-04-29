import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';

export default class KieslijstSplitterComponent extends Component {
  @service store;

  @tracked selectedKieslijst;
  @tracked selectedFractie;

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
}
