import Component from '@glimmer/component';

export default class SharedTooltipComponent extends Component {
  get alignment() {
    if (this.args.alignment) {
      return this.args.alignment;
    }
    return 'center';
  }
}
