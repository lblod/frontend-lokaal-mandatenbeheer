import { Namespace } from 'rdflib';

export {
  MU,
  FORM,
  RDF,
  XSD,
  SKOS,
  SHACL,
} from '@lblod/submission-form-helpers';

export const EXT = new Namespace('http://mu.semte.ch/vocabularies/ext/');
export const PROV = new Namespace('http://www.w3.org/ns/prov#');
export const ORG = new Namespace('http://www.w3.org/ns/org#');
export const PERSOON = new Namespace('http://data.vlaanderen.be/ns/persoon#');
export const FOAF = new Namespace('http://xmlns.com/foaf/0.1/');
export const ADMS = new Namespace('http://www.w3.org/ns/adms#');
export const MANDAAT = new Namespace('http://data.vlaanderen.be/ns/mandaat#');
export const LMB = new Namespace('http://lblod.data.gift/vocabularies/lmb/');

export const FIELD_OPTION = new Namespace(
  'http://lblod.data.gift/vocabularies/form-field-options/'
);
