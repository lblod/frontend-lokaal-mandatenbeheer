export function isPredicateInObserverChange(
  { inserts, deletes },
  predicateAsString
) {
  const predicateArray = [...inserts, ...deletes].map(
    (triple) => triple.predicate.value
  );

  return predicateArray.includes(predicateAsString);
}
