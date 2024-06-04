import { SHACL, RDF } from '@lblod/submission-form-helpers';
import { EXT } from 'frontend-lmb/rdf/namespaces';

export const constraintMinLength = (literal, options) => {
  if (!literal) {
    return false;
  }

  const { constraintUri, store, formGraph } = options;
  const validationTypeNode = store.any(
    constraintUri,
    RDF('type'),
    undefined,
    formGraph
  );

  if (
    !validationTypeNode ||
    validationTypeNode.value !== EXT('MinLength').value
  ) {
    return true;
  }

  let minCharacters = 0;
  const charactersLiteral = store.any(
    constraintUri,
    SHACL('minLength'),
    undefined,
    formGraph
  );
  if (charactersLiteral) {
    minCharacters = charactersLiteral.value;
  }

  return literal.value.trim().length >= minCharacters;
};
