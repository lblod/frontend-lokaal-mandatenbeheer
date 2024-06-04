import { registerCustomValidation } from '@lblod/submission-form-helpers';
import { rijksregisternummerValidation } from './rijksregisternummer';
import { isValidRangorde } from './mandataris-rangorde';

export const registerCustomValidations = () => {
  registerCustomValidation(
    'http://mu.semte.ch/vocabularies/ext/ValidRijksregisternummer',
    rijksregisternummerValidation
  );
  registerCustomValidation(
    'http://mu.semte.ch/vocabularies/ext/ValidRangorde',
    isValidRangorde
  );
};
