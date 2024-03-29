import { FORM } from 'frontend-lmb/rdf/namespaces';

export const getFormProperty = (args, property) => {
  return args.formStore.match(
    args.field.uri,
    FORM(property),
    undefined,
    args.graphs.formGraph
  )[0].object.value;
};
