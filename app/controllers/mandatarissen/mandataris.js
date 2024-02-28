import Controller from '@ember/controller';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

export default class MandatarissenMandatarisController extends Controller {
  @tracked editing = false;

  @action
  edit() {
    this.editing = !this.editing;
  }
}
