import { modifier } from 'ember-modifier';

export default modifier((element) => {
  const parent = element.parentNode.parentNode;
  const indexOfOwnParent = Array.from(parent.children).indexOf(
    element.parentNode
  );
  const nextNode = parent.children[indexOfOwnParent + 1];

  parent.insertBefore(element, nextNode);

  return () => {
    parent.removeChild(element);
  };
});
