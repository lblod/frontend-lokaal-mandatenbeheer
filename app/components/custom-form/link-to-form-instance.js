import Component from '@glimmer/component';

import { A } from '@ember/array';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

export default class CustomFormLinkToFormInstance extends Component {
  @tracked formType;
  @tracked form;
  @tracked fields = A([]);
  @tracked selectedFormFields = A([]);

  @action
  selectFormType(type) {
    console.log({ type });
  }

  @action
  selectFormOfType(form) {
    console.log({ form });
  }

  @action
  updateSelectedFields(selected) {
    console.log({ selected });
  }

  get formTypes() {
    return [];
  }

  get forms() {
    return [];
  }

  get fieldOptions() {
    return [];
  }
}
