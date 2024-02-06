import {
  updateSimpleFormValue,
  triplesForPath,
} from '@lblod/submission-form-helpers';

export const replaceSingleFormValue = (storeOptions, newValue) => {
  // Cleanup old value(s) in the store
  const matches = triplesForPath(storeOptions, true).values;
  matches.forEach((m) => updateSimpleFormValue(storeOptions, undefined, m));

  if (![null, undefined].find((value) => value === newValue)) {
    updateSimpleFormValue(storeOptions, newValue);
  }
};
