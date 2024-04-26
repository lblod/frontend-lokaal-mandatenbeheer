import Model, { attr } from '@ember-data/model';
import { MANDATARIS_BEKRACHTIGD_STATE } from 'frontend-lmb/utils/well-known-uris';

export default class MandatarisPublicationStatusCodeModel extends Model {
  @attr uri;
  @attr label;
  @attr('number') order;

  get isBekrachtigd() {
    return this.uri === MANDATARIS_BEKRACHTIGD_STATE;
  }
}
