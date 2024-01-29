import { NamedNode } from 'rdflib';

export const FORM_GRAPH = new NamedNode('http://data.lblod.info/form');
export const META_GRAPH = new NamedNode('http://data.lblod.info/metagraph');
export const SOURCE_GRAPH = new NamedNode(`http://data.lblod.info/sourcegraph`);

export const JSON_API_TYPE = 'application/vnd.api+json';

export const ACCEPT_HEADER = {
  headers: {
    Accept: JSON_API_TYPE,
  },
};

export const MALE_ID = '5ab0e9b8a3b2ca7c5e000028';
export const FEMALE_ID = '5ab0e9b8a3b2ca7c5e000029';
