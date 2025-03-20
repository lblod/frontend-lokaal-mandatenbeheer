import { modifier } from 'ember-modifier';

export default modifier(function doActionMethod(element, [method]) {
  method();
});
