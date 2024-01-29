import Model, { attr } from '@ember-data/model';
import {
  FRACTIETYPE_ONAFHANKELIJK,
  FRACTIETYPE_SAMENWERKINGSVERBAND,
} from 'frontend-lmb/utils/well-known-uris';

export default class FractietypeModel extends Model {
  @attr uri;
  @attr label;

  get isOnafhankelijk() {
    return this.uri === FRACTIETYPE_ONAFHANKELIJK;
  }

  get isSamenwerkingsverband() {
    return this.uri === FRACTIETYPE_SAMENWERKINGSVERBAND;
  }
}
