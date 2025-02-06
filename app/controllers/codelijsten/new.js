import Controller from '@ember/controller';

import { A } from '@ember/array';
import { action } from '@ember/object';
import { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';

export default class CodelijstenNewController extends Controller {
  @service store;

  @tracked isSaving;
  @tracked name;
  @tracked concepten = A();

  @action
  updateName(event) {
    this.name = event?.target?.value;
  }

  get canSave() {
    return this.name?.length > 2;
  }

  @action
  async saveCodelist() {
    console.log('save', {
      label: this.name ?? '',
      isReadOnly: false,
      concepts: this.concepten.toArray(),
    });
    return;
    this.isSaving = true;
    const codelijst = this.store.createRecord('codelist', {
      label: this.name ?? '',
      isReadOnly: false,
      concepts: this.concepten.toArray(),
    });
    await codelijst.save();
    this.isSaving = false;
  }
}
