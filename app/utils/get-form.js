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

const getFormFrom = async (store, formId) => {
  const definition = store.peekRecord('form-definition', formId);
  if (definition) return definition;

  const { formTtl, metaTtl, prefix } = await retrieveForm(formId);

  return store.createRecord('form-definition', {
    id: formId,
    formTtl,
    metaTtl,
    prefix,
  });
};

export { getFormFrom };
