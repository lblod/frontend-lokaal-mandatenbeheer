import Component from '@glimmer/component';

export default class MandatarisHistoryRowComponent extends Component {
  get beleidsdomeinCount() {
    return this.args.mandataris.beleidsdomein.length;
  }
}
