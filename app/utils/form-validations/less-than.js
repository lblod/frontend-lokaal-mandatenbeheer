import { EXT, SHACL, XSD } from 'frontend-lmb/rdf/namespaces';
import { Literal } from 'rdflib';
import moment from 'moment';

export function lessThan([inputValue], options) {
  const comparisonPredicate = options.store.any(
    options.constraintUri,
    EXT('ValueToCompare'),
    undefined,
    options.formGraph
  );

  const threshold = getValue(comparisonPredicate, options);

  if (!inputValue || !threshold) {
    return true;
  }

  const inputLiteral = Literal.toJS(inputValue);
  const thresholdLiteral = Literal.toJS(threshold);

  const isDateTime = options.store.match(
    options.constraintUri,
    SHACL('datatype'),
    XSD('dateTime'),
    options.formGraph
  ).length;

  if (isDateTime) {
    return moment(inputLiteral).isBefore(moment(thresholdLiteral));
  } else {
    return inputLiteral < thresholdLiteral;
  }
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
