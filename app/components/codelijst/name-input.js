import Component from '@glimmer/component';

import { tracked } from '@glimmer/tracking';

import { restartableTask, timeout } from 'ember-concurrency';

import { INPUT_DEBOUNCE } from 'frontend-lmb/utils/constants';

export default class CodelijstNameInput extends Component {
  @tracked isValid;
  @tracked isDuplicate;

  minCharacters = 2;

  updateName = restartableTask(async (event) => {
    await timeout(INPUT_DEBOUNCE);
    const name = event?.target?.value;
    this.isValid = this.isValidName(name);
    this.isDuplicate = this.isDuplicateName(name);

    this.args.onUpdate({
      name: name.trim(),
      isValid: this.isValid && !this.isDuplicate,
    });
  });

  isValidName(name) {
    return name && name?.trim().length > this.minCharacters;
  }

  isDuplicateName(name) {
    return false; // TODO: search for name
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
