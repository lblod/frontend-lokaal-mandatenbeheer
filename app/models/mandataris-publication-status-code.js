import Model, { attr } from '@ember-data/model';
import { MANDATARIS_BEKRACHTIGD_STATE } from 'frontend-lmb/utils/well-known-uris';

export default class MandatarisPublicationStatusCodeModel extends Model {
  @attr uri;
  @attr label;

  get isBekrachtigd() {
    return this.uri === MANDATARIS_BEKRACHTIGD_STATE;
  }

  rdfaBindings = {
    class: 'http://www.w3.org/2004/02/skos/core#Concept',
    label: 'http://www.w3.org/2004/02/skos/core#prefLabel',
  };
}
