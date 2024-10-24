export function isPredicateInObserverChange({ inserts, deletes }, predicate) {
  const predicateArray = [...inserts, ...deletes].map(
    (triple) => triple.predicate.value
  );

  return predicateArray.includes(predicate.value);
}
