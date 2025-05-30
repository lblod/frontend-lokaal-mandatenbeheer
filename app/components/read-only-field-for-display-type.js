import Component from '@glimmer/component';

import { triplesForPath } from '@lblod/submission-form-helpers';
import { isNamedNode, Literal } from 'rdflib';
import moment from 'moment';

import {
  DATE_CUSTOM_DISPLAY_TYPE,
  LINK_TO_FORM_CUSTOM_DISPLAY_TYPE,
} from 'frontend-lmb/utils/well-known-uris';

export default class ReadOnlyFieldForDisplayType extends Component {
  get value() {
    const matches = triplesForPath(this.args.storeOptions);

    if (this.args.field.displayType === LINK_TO_FORM_CUSTOM_DISPLAY_TYPE) {
      return `${matches.values.length ?? 0} link(s)`;
    }

    const firstMatch = matches.values?.at(0);
    if (!firstMatch || isNamedNode(firstMatch)) {
      return null;
    }

    return this.formatLiteral(firstMatch);
  }

  get displayType() {
    return this.args.field?.displayType;
  }

  formatLiteral(literal) {
    if (this.displayType === DATE_CUSTOM_DISPLAY_TYPE) {
      return moment(Literal.toJS(literal)).format('DD-MM-YYYY');
    }

    return Literal.toJS(literal);
  }
}
