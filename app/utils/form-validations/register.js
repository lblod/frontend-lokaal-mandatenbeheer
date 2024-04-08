import { registerCustomValidation } from '@lblod/submission-form-helpers';
import { rijksregisternummerValidation } from './rijksregisternummer';

export const registerCustomValidations = () => {
  registerCustomValidation(
    'http://mu.semte.ch/vocabularies/ext/ValidRijksregisternummer',
    rijksregisternummerValidation
  );
};
