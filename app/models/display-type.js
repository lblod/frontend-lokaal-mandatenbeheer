import Model, { attr } from '@ember-data/model';

import {
  CONCEPT_SCHEME_MULTI_SELECTOR_CUSTOM_DISPLAY_TYPE,
  CONCEPT_SCHEME_SELECTOR_CUSTOM_DISPLAY_TYPE,
  LINK_TO_FORM_CUSTOM_DISPLAY_TYPE,
} from 'frontend-lmb/utils/well-known-uris';

export default class DisplayTypeModel extends Model {
  @attr label;
  @attr uri;

  get isConceptSchemeSelector() {
    const fieldUris = [
      CONCEPT_SCHEME_SELECTOR_CUSTOM_DISPLAY_TYPE,
      CONCEPT_SCHEME_MULTI_SELECTOR_CUSTOM_DISPLAY_TYPE,
    ];

    return fieldUris.includes(this.uri);
  }

  get isLinkToForm() {
    return this.uri === LINK_TO_FORM_CUSTOM_DISPLAY_TYPE;
  }
}
