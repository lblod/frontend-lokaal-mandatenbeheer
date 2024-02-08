import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

const TERMINATE_MODE = 'terminate';
const CORRECT_MODE = 'correct';

export default class MandatenbeheerMandatarisEditPromptComponent extends Component {
  @tracked editMode = null;

  get isTerminating() {
    return this.editMode === TERMINATE_MODE;
  }

  get isCorrecting() {
    return this.editMode === CORRECT_MODE;
  }

  @action
  terminate() {
    this.editMode = TERMINATE_MODE;
  }

  @action
  correct() {
    this.editMode = CORRECT_MODE;
  }

  @action
  cancel() {
    this.editMode = null;
  }

  @action
  onSave() {
    // TODO For resoures caching
    setTimeout(() => this.args.mandataris.reload(), 1000);
  }
}
