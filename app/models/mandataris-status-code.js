import Model, { attr } from '@ember-data/model';
import { MANDATARIS_EFFECTIEF_STATE } from 'frontend-lmb/utils/well-known-uris';

export default class MandatarisStatusCodeModel extends Model {
  @attr label;
  @attr uri;

  isEffective() {
    return this.uri === MANDATARIS_EFFECTIEF_STATE;
  }
}
