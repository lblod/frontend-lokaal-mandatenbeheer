import Component from '@glimmer/component';
import { action } from '@ember/object';

export default class MandatarisHistoryRowComponent extends Component {
  get beleidsdomeinCount() {
    return this.args.mandataris.beleidsdomein.length;
  }

  get sortedCorrections() {
    return this.args.corrections.sort((a, b) => {
      return a.issued < b.issued ? 1 : -1;
    });
  }

  get currentVersion() {
    return this.sortedCorrections?.[0];
  }

  @action delayedScrollToTop() {
    setTimeout(() => {
      window.document
        .getElementsByClassName('notification-count-circle')[0]
        .scrollIntoView({ block: 'center' });
    }, 100);
  }
}
