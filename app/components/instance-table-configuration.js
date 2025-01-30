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
  }

  get sortedLabels() {
    return this.labels.sort((a, b) => a.name.localeCompare(b.name));
  }
}
