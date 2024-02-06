const notifyFormSavedSuccessfully = (toaster) => {
  toaster.notify('Het formulier werd correct opgeslagen.', 'Succes', {
    type: 'success',
    icon: 'circle-check',
  });
};

export { notifyFormSavedSuccessfully };
