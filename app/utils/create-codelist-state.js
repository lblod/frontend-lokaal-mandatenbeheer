export function createKeyValueState(codelijst, concepten) {
  if (!codelijst) {
    throw 'No codelijst provided for creating key value codelist state';
  }

  const keyValue = {
    [codelijst.id]: codelijst.label,
  };
  for (const concept of concepten) {
    const key = concept.id + concept.order + concept.isDeleted;
    keyValue[key] = concept.label;
  }

  return keyValue;
}
