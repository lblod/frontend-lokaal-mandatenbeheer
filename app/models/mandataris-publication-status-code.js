import Model, { attr } from '@ember-data/model';

import {
  MANDATARIS_BEKRACHTIGD_PUBLICATION_STATE,
  MANDATARIS_DRAFT_PUBLICATION_STATE,
  MANDATARIS_EFFECTIEF_PUBLICATION_STATE,
} from 'frontend-lmb/utils/well-known-uris';

export default class MandatarisPublicationStatusCodeModel extends Model {
  @attr uri;
  @attr label;
  @attr('number') order;

  get isBekrachtigd() {
    return this.uri === MANDATARIS_BEKRACHTIGD_PUBLICATION_STATE;
  }

  get isEffectief() {
    return this.uri === MANDATARIS_EFFECTIEF_PUBLICATION_STATE;
  }

  get isDraft() {
    return this.uri === MANDATARIS_DRAFT_PUBLICATION_STATE;
  }

  get displayLabel() {
    const statusMapping = {
      [MANDATARIS_DRAFT_PUBLICATION_STATE]: 'Draft',
      [MANDATARIS_EFFECTIEF_PUBLICATION_STATE]: 'Niet bekrachtigd',
      [MANDATARIS_BEKRACHTIGD_PUBLICATION_STATE]: 'Bekrachtigd',
    };

    return statusMapping[this.uri] ?? 'Niet beschikbaar';
  }
}
