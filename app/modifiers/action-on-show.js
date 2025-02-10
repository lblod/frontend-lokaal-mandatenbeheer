import { modifier } from 'ember-modifier';

export default modifier((element, methods) => {
  const method = methods.length ? methods[0] : null;

  return method() ?? null;
});
