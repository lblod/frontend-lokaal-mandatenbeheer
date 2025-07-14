import Component from '@glimmer/component';

import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { isValidUri } from 'frontend-lmb/utils/is-valid-uri';

export default class PredicaatInput extends Component {
  @tracked uri;

  get predicaatUri() {
    return this.uri || this.args.value;
  }

  get isValid() {
    if (!this.predicaatUri) {
      return true;
    }

    return isValidUri(this.uri);
  }

  get isBlockedUri() {
    if (!this.isValid) {
      return false;
    }

    return [
      'http://www.w3.org/1999/02/22-rdf-syntax-ns#>Type',
      'http://lblod.data.gift/vocabularies/forms/displayType',
      'http://lblod.data.gift/vocabularies/forms/includes',
      'http://lblod.data.gift/vocabularies/forms/initGenerator',
      'http://lblod.data.gift/vocabularies/forms/validatedBy',
      'http://lblod.data.gift/vocabularies/forms/targetType',
      'http://lblod.data.gift/vocabularies/forms/targetLabel',
      'http://lblod.data.gift/vocabularies/forms/initGenerator',
      'http://lblod.data.gift/vocabularies/forms/prototype',
      'http://lblod.data.gift/vocabularies/forms/dataGenerator',
      'http://lblod.data.gift/vocabularies/forms/shape',
      'http://lblod.data.gift/vocabularies/forms/prefix',
      'http://lblod.data.gift/vocabularies/forms/forType',
      'http://lblod.data.gift/vocabularies/forms/showInSummary',
      'http://www.w3.org/ns/shacl#name',
      'http://www.w3.org/ns/shacl#order',
      'http://www.w3.org/ns/shacl#datatype',
      'http://www.w3.org/ns/shacl#path',
      'http://www.w3.org/ns/shacl#group',
      'http://www.w3.org/ns/shacl#severity',
      'http://www.w3.org/ns/shacl#resultMessage',
      'http://mu.semte.ch/vocabularies/ext/ValueToCompare',
      'http://mu.semte.ch/vocabularies/ext/prefix',
      'http://mu.semte.ch/vocabularies/ext/withHistory',
      'http://mu.semte.ch/vocabularies/core/uuid',
    ].includes(this.predicaatUri);
  }

  @action
  onUpdate(event) {
    this.uri = event.target?.value;

    if (this.isValid && !this.isBlockedUri) {
      this.args.onUpdate?.(this.uri);
    }
  }
}
