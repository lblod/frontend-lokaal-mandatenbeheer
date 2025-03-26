import { EXT } from 'frontend-lmb/rdf/namespaces';

export function greaterThan([inputValue], options) {
  const comparisonPredicate = options.store.any(
    options.constraintUri,
    EXT('ValueToCompare'),
    undefined,
    options.formGraph
  );

  const threshold = getValue(comparisonPredicate, options);

  if (!threshold) {
    return false;
  }
  if (!inputValue) {
    return true;
  }
  console.log(inputValue.value >= threshold.value);
  return inputValue.value >= threshold.value;
}

function getValue(predicate, options) {
  const object = options.store.any(
    options.sourceNode,
    predicate,
    undefined,
    options.sourceGraph
  );
  return object;
}
