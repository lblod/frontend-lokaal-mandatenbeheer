import Model, { attr } from '@ember-data/model';
import {
  MANDATARIS_BEEINDIGD_STATE,
  MANDATARIS_TITELVOEREND_STATE,
  MANDATARIS_VERHINDERD_STATE,
} from 'frontend-lmb/utils/well-known-uris';

export default class MandatarisStatusCodeModel extends Model {
  @attr label;
  @attr uri;

  get isVerhinderd() {
    const states = [MANDATARIS_VERHINDERD_STATE, MANDATARIS_TITELVOEREND_STATE];

    return states.includes(this.uri);
  }

  get isBeeindigd() {
    return this.uri === MANDATARIS_BEEINDIGD_STATE;
  }
}
