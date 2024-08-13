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

export const INPUT_DEBOUNCE = 250;
export const SEARCH_TIMEOUT = 500;
// the resource cache is invalidated because of our form update, but the service doesn't wait for it before returning.
// this is a temporary hack while we wait for backend driven frontend revalidation
export const RESOURCE_CACHE_TIMEOUT = 1000;

export const API = {
  MANDATARIS_SERVICE: '/mandataris-api',
};
export const STATUS_CODE = {
  OK: 200,
};

export const placeholderOnafhankelijk = {
  uri: `http://placeholder-onafhankelijk`,
  id: 'ONAFHANKELIJK-ID',
  naam: 'Onafhankelijk',
};
