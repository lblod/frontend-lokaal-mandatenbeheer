import Component from '@glimmer/component';

import { A } from '@ember/array';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { service } from '@ember/service';

import { showWarningToast } from 'frontend-lmb/utils/toasts';

export default class InstanceTableConfiguration extends Component {
  @service toaster;
  @tracked labels = A();

  constructor() {
    super(...arguments);

    let labelsWithIsSelectedProperty = this.args.labels.map((label) => {
      let state = false;

      if (label.var === 'uri') {
        state = true;
      }
      return {
        ...label,
        isSelected: state,
      };
    });

    this.labels.push(...labelsWithIsSelectedProperty);
  }

  @action
  toggleLabel(label) {
    if (this.disabledSelection) {
      return;
    }

    if (label.isSelected && this.selectedLabels.length === 1) {
      showWarningToast(
        this.toaster,
        'Er moet minstens 1 kolom aangeduid zijn.',
        'Kolom configuratie'
      );
      return;
    }
    const selectedState = label.isSelected;
    this.labels.removeObject(label);

    delete label.isSelected;
    this.labels.push({ ...label, isSelected: !selectedState });

    this.args.onSelectionUpdated(this.selectedLabels);
  }

  get sortedLabels() {
    return this.labels.sort((a, b) => a.name.localeCompare(b.name));
  }

  get selectedLabels() {
    return this.labels?.filter((label) => label.isSelected) ?? [];
  }

  get disabledSelection() {
    return this.args.disabledSelection;
  }
}
