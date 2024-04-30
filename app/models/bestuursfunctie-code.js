import Model, { attr } from '@ember-data/model';
import {
  BESTUURSFUNCTIE_CODE_BURGEMEESTER,
  BESTUURSFUNCTIE_CODE_LEIDINGGEVEND_AMBTENAAR,
} from 'frontend-lmb/utils/well-known-uris';

export default class BestuursfunctieCodeModel extends Model {
  @attr uri;
  @attr label;

  get isLeidinggevendAmbtenaar() {
    return this.uri === BESTUURSFUNCTIE_CODE_LEIDINGGEVEND_AMBTENAAR;
  }

  get isBurgemeester() {
    return this.uri === BESTUURSFUNCTIE_CODE_BURGEMEESTER;
  }
}
