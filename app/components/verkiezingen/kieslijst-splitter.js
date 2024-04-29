import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';

export default class KieslijstSplitterComponent extends Component {
  @service store;

  @tracked selected;

  @action
  test(value) {
    console.log(value);
  }
}
