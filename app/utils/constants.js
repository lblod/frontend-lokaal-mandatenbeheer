import { NamedNode } from 'rdflib';

export const FORM_GRAPH = new NamedNode('http://data.lblod.info/form');
export const META_GRAPH = new NamedNode('http://data.lblod.info/metagraph');
export const SOURCE_GRAPH = new NamedNode(`http://data.lblod.info/sourcegraph`);

export const ACCEPT_HEADER = {
  headers: {
    Accept: 'application/vnd.api+json',
  },
};
export const CONTENT_HEADER = {
  'Content-Type': 'application/vnd.api+json',
};

export const FUNCTIONARIS_STATUS_CODE_AANGESTELD_URI =
  'http://data.vlaanderen.be/id/concept/functionarisStatusCode/45b4b155-d22a-4eaf-be3a-97022c6b7fcd';
export const BESTUURSFUNCTIE_CODE_LEIDINGGEVEND_AMBTENAAR_URI =
  'http://data.vlaanderen.be/id/concept/BestuursfunctieCode/855489b9-b584-4f34-90b2-39aea808cd9f';
export const FRACTIETYPE_ONAFHANKELIJK_URI =
  'http://data.vlaanderen.be/id/concept/Fractietype/Onafhankelijk';
export const FRACTIETYPE_SAMENWERKINGSVERBAND_URI =
  'http://data.vlaanderen.be/id/concept/Fractietype/Samenwerkingsverband';
export const BESTUURSEENHEID_CLASSIFICATIECODE_OCMW_URI =
  'http://data.vlaanderen.be/id/concept/BestuurseenheidClassificatieCode/5ab0e9b8a3b2ca7c5e000002';
