import { registerCustomValidation } from '@lblod/submission-form-helpers';
import { isValidRijksregisternummer } from './rijksregisternummer';

const rijksregisternummerValidation = (value) => {
  return isValidRijksregisternummer(value.value);
};

export const registerCustomValidations = () => {
  registerCustomValidation(
    'http://mu.semte.ch/vocabularies/ext/ValidRijksregisternummer',
    rijksregisternummerValidation
  );
};
