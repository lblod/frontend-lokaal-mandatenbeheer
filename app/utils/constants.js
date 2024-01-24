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
