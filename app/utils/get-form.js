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

// Split into definition and prefix because this structure is expected in instance components
const format = ({ id, formTtl, metaTtl, prefix }) => ({
  definition: {
    id,
    formTtl,
    metaTtl,
  },
  prefix,
});

const getForm = async (store, formId) => {
  const definitionModel = 'form-definition';

  const definition = store.peekRecord(definitionModel, formId);
  if (definition) return format(definition);

  const { formTtl, metaTtl, prefix } = await retrieveForm(formId);

  return format(
    store.createRecord(definitionModel, {
      id: formId,
      formTtl,
      metaTtl,
      prefix,
    })
  );
};

export { getForm };
