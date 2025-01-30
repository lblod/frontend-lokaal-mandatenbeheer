import Component from '@glimmer/component';

import { A } from '@ember/array';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

export default class InstanceTableConfiguration extends Component {
  @tracked labels = A([]);

  constructor() {
    super(...arguments);

    const labelsWithIsSelectedProperty = this.args.labels.map((label) => {
      return {
        ...label,
        isSelected: false,
      };
    });

    this.labels.clear();
    this.labels.push(...labelsWithIsSelectedProperty);
  }

  @action
  toggleLabel(label) {
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
    const labelCopy = JSON.parse(JSON.stringify(this.labels.toArray()));
    return labelCopy
      .map((label) => {
        if (!label.isSelected) {
          return null;
        }

        delete label.isSelected;
        return label;
      })
      .filter((label) => label);
  }
}
