import Component from '@glimmer/component';

import { restartableTask, timeout } from 'ember-concurrency';
import { INPUT_DEBOUNCE } from 'frontend-lmb/utils/constants';

export default class CodelijstNameInput extends Component {
  updateName = restartableTask(async (event) => {
    await timeout(INPUT_DEBOUNCE);
    const name = event?.target?.value;

    this.args.onUpdate({
      name: name.trim(),
      isValid: this.isValidName(name) && !this.isDuplicateName(name),
    });
  });

  isValidName(name) {
    return name && name?.trim().length > 2;
  }

  isDuplicateName(name) {
    return false; // TODO: search for name
  }
}
