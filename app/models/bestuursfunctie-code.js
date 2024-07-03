import Model, { attr } from '@ember-data/model';

import {
  MANDAAT_AANGEWEZEN_BURGEMEESTER_CODE,
  MANDAAT_BURGEMEESTER_CODE,
  MANDAAT_DISTRICT_BURGEMEESTER_CODE,
} from 'frontend-lmb/utils/well-known-uris';

export default class BestuursfunctieCodeModel extends Model {
  @attr uri;
  @attr label;

  get isBurgemeester() {
    return (
      this.uri === MANDAAT_BURGEMEESTER_CODE ||
      this.uri === MANDAAT_AANGEWEZEN_BURGEMEESTER_CODE ||
      this.uri === MANDAAT_DISTRICT_BURGEMEESTER_CODE
    );
  }
}
