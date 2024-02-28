const notifyFormSavedSuccessfully = (toaster) => {
  toaster.notify('Het formulier werd correct opgeslagen.', 'Succes', {
    type: 'success',
    icon: 'circle-check',
  });
};

const showSuccessToast = (toaster, message) => {
  toaster.success(message, {
    timeout: 5000,
  });
};

const showErrorToast = (toaster, message) => {
  toaster.error(message);
};

export { notifyFormSavedSuccessfully, showSuccessToast, showErrorToast };
