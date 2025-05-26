import { EXT, FORM } from 'frontend-lmb/rdf/namespaces';
import { Literal, NamedNode } from 'rdflib';

export const getFormProperty = (args, property) => {
  return args.formStore.match(
    args.field.uri,
    FORM(property),
    undefined,
    args.graphs.formGraph
  )[0].object.value;
};

export const isCustomForm = (forkingStore) => {
  if (!forkingStore) {
    console.warn(
      'Forkingstore is undefined, returning false for ext:isCustomForm'
    );
    return false;
  }

  return !!(
    forkingStore.any(
      null,
      EXT('isCustomForm'),
      new Literal(
        'true',
        null,
        new NamedNode('http://www.w3.org/2001/XMLSchema#boolean')
      )
    ) || forkingStore.any(null, EXT('isCustomForm'), true)
  );
};

export const isFieldShownInSummmary = (forkingStore, fieldNode) => {
  if (!forkingStore) {
    console.warn(
      'Forkingstore is undefined, returning false for form:showInSummary'
    );
    return false;
  }

  return !!(
    forkingStore.any(
      fieldNode,
      FORM('showInSummary'),
      new Literal(
        'true',
        null,
        new NamedNode('http://www.w3.org/2001/XMLSchema#boolean')
      )
    ) || forkingStore.any(fieldNode, FORM('showInSummary'), true)
  );
};
