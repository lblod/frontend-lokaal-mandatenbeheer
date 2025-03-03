import Component from '@glimmer/component';

import { action } from '@ember/object';
import { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';

export default class CodelijstNameInput extends Component {
  @service store;

  @tracked isValid = true;
  @tracked isDuplicate = false;

  minCharacters = 2;

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
    return name && name?.trim().length > this.minCharacters;
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
      return 'Er bestaat al een codelijst met deze naam';
    }

    return null;
  }

  get warningMessage() {
    if (!this.isValid && this.args.name) {
      return `Naam moet minsten ${this.minCharacters + 1} lang zijn`;
    }
    return null;
  }
}
