import Component from '@glimmer/component';

export default class SharedTooltipComponent extends Component {
  get alignment() {
    if (this.args.alignment) {
      return this.args.alignment;
    }
    return 'center';
  }

  get shouldRender() {
    if (!this.args.showTooltip) {
      return false;
    }
    if (!this.args.toolTipText || this.args.toolTipText.trim().length === 0) {
      return false;
    }
    return true;
  }
}
