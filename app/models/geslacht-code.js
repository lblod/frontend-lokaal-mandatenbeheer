import Model, { attr } from '@ember-data/model';
import { MALE_ID } from 'frontend-lmb/utils/constants';

export default class GeslachtCodeModel extends Model {
  @attr uri;
  @attr label;

  get isMale() {
    return this.id === MALE_ID;
  }
}
