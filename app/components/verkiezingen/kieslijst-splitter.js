import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';

export default class KieslijstSplitterComponent extends Component {
  @service store;

  @tracked selectedKieslijst;

  @action
  selectKieslijst(lijst) {
    this.selectedKieslijst = lijst.id;
  }

  @action
  tmp() {
    console.log('Temporary button action');
  }
}
