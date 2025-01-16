import Component from '@glimmer/component';

import { triplesForPath } from '@lblod/submission-form-helpers';
import { isLiteral } from 'rdflib';

export default class ReadOnlyFieldForDisplayType extends Component {
  get isTextField() {
    return (
      this.args.field.displayType ===
      'http://lblod.data.gift/display-types/lmb/custom-string-input'
    );
  }

  get value() {
    const matches = triplesForPath(this.args.storeOptions);
    const literal = matches.values.filter((value) => isLiteral(value))?.at(0);

    return literal?.value;
  }
}
