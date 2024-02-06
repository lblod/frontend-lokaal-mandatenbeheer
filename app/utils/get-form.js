import { FORM_DEFINITION_MODEL } from './well-known-ids';

const retrieveForm = async (id) => {
  const response = await fetch(`/form-content/${id}`);
  if (!response.ok) {
    let error = new Error(response.statusText);
    error.status = response.status;
    throw error;
  }

  const form = await response.json();
  if (!form.formTtl) throw new Error('Received form without formTtl');

  return form;
};

const getForm = async (store, formId) => {
  const definition = store.peekRecord(FORM_DEFINITION_MODEL, formId);
  if (definition) return definition;

  const { formTtl, metaTtl, prefix } = await retrieveForm(formId);

  return store.createRecord(FORM_DEFINITION_MODEL, {
    id: formId,
    formTtl,
    metaTtl,
    prefix,
  });
};

export { getForm };
