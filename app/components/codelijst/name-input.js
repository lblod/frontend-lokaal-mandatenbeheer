import Component from '@glimmer/component';

import { action } from '@ember/object';
import { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';

export default class CodelijstNameInput extends Component {
  @service store;

  @tracked isValid = true;
  @tracked isDuplicate = false;

  @action
  async updateName(event) {
    const name = event?.target?.value;
    this.isValid = this.isValidName(name);
    this.isDuplicate = await this.isDuplicateName(name);

    this.args.onUpdate({
      name: name.trim(),
      isValid: this.isValid && !this.isDuplicate,
    });
  }

  isValidName(name) {
    return name && name?.trim().length >= 1;
  }

  async isDuplicateName(name) {
    const searchName = name.trim().toLowerCase();
    const duplicateMatches = await this.store.query('concept-scheme', {
      'filter[label]': searchName,
    });

    return (
      duplicateMatches.length === 1 &&
      duplicateMatches[0].label.toLowerCase() === searchName &&
      name !== this.args.name
    );
  }

  get errorMessage() {
    if (this.isDuplicate) {
      return 'Er bestaat al een codelijst met deze naam.';
    }

    if (!this.isValid) {
      return `Naam is verplicht.`;
    }

    return null;
  }
}
