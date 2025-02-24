import Model, { attr } from '@ember-data/model';

import {
  MANDATARIS_BEKRACHTIGD_PUBLICATION_STATE,
  MANDATARIS_DRAFT_PUBLICATION_STATE,
  MANDATARIS_NIET_BEKRACHTIGD_PUBLICATION_STATE,
} from 'frontend-lmb/utils/well-known-uris';

export default class MandatarisPublicationStatusCodeModel extends Model {
  @attr uri;
  @attr label;
  @attr('number') order;

  get isBekrachtigd() {
    return this.uri === MANDATARIS_BEKRACHTIGD_PUBLICATION_STATE;
  }

  get isNietBekrachtigd() {
    return this.uri === MANDATARIS_NIET_BEKRACHTIGD_PUBLICATION_STATE;
  }

  get isDraft() {
    return this.uri === MANDATARIS_DRAFT_PUBLICATION_STATE;
  }

  get displayLabel() {
    return this.uri ? this.label : 'Niet beschikbaar';
  }
}
