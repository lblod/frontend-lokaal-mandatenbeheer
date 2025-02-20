export function createKeyValueState(codelijst, concepten) {
  if (!codelijst) {
    throw 'No codelijst provided for creating key value codelist state';
  }

  const keyValue = {
    [codelijst.id]: codelijst.label,
  };
  for (const concept of concepten) {
    keyValue[concept.id] = concept.label;
  }

  return keyValue;
}
