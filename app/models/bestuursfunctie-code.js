import Model, { attr } from '@ember-data/model';
import { BESTUURSFUNCTIE_CODE_LEIDINGGEVEND_AMBTENAAR } from 'frontend-lmb/utils/well-known-uris';

export default class BestuursfunctieCodeModel extends Model {
  @attr uri;
  @attr label;

  get isLeidinggevendAmbtenaar() {
    return this.uri === BESTUURSFUNCTIE_CODE_LEIDINGGEVEND_AMBTENAAR;
  }

  rdfaBindings = {
    class: 'http://www.w3.org/2004/02/skos/core#Concept',
    label: 'http://www.w3.org/2004/02/skos/core#prefLabel',
    scopeNote: 'http://www.w3.org/2004/02/skos/core#scopeNote',
  };
}
