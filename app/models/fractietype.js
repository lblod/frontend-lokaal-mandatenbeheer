import Model, { attr } from '@ember-data/model';
import {
  FRACTIETYPE_ONAFHANKELIJK_URI,
  FRACTIETYPE_SAMENWERKINGSVERBAND_URI,
} from 'frontend-lmb/utils/constants';

export default class FractietypeModel extends Model {
  @attr uri;
  @attr label;

  get isOnafhankelijk() {
    return this.uri === FRACTIETYPE_ONAFHANKELIJK_URI;
  }

  get isSamenwerkingsverband() {
    return this.uri === FRACTIETYPE_SAMENWERKINGSVERBAND_URI;
  }
}
