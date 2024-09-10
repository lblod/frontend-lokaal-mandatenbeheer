import Model, { attr } from '@ember-data/model';

export default class MandatarisStatusCodeModel extends Model {
  @attr label;
  @attr uri;

  get isVerhinderd() {
    return this.label && this.label.toLowerCase() === 'verhinderd';
  }
}
