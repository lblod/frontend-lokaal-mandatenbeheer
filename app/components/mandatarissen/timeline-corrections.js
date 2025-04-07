import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';

export default class MandatarissenTimelineCorrections extends Component {
  @tracked
  collapsed = true;
  get correctionCount() {
    return (this.args.event?.corrections?.length || 0) - 1;
  }

  get corrections() {
    return this.args.event.corrections.map((corr, index) => {
      return {
        ...corr,
        type:
          index === this.args.event.corrections.length - 1 ? 'Start' : 'Edit',
      };
    });
  }

  get showCorrections() {
    return this.correctionCount > 1 && this.args.event.type != 'Einde';
  }

  @action
  toggleCollapsed(event) {
    event.stopPropagation();
    event.preventDefault();
    this.collapsed = !this.collapsed;
  }
}
