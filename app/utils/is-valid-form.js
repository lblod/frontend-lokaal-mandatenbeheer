import { validateForm } from '@lblod/ember-submission-form-fields';

export function isValidForm(formInfo) {
  if (isFormInfo(formInfo)) {
    return false;
  }

  return validateForm(formInfo.formNode, {
    ...formInfo.graphs,
    sourceNode: formInfo.sourceNode,
    store: formInfo.formStore,
  });
}

function isFormInfo(formInfo) {
  if (!formInfo) {
    return false;
  }

  const properties = ['graphs', 'sourceNode', 'formStore'];

  const arePropertiesSet = Object.keys(formInfo).map((key) =>
    properties.includes(key)
  );

  return arePropertiesSet.every((isSet) => isSet);
}
