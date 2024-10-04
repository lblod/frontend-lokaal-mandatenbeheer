import { registerCustomValidation } from '@lblod/submission-form-helpers';
import { rijksregisternummerValidation } from './rijksregisternummer';
import { isValidRangorde } from './mandataris-rangorde';
import { isValidMandatarisDate } from './mandataris-date-in-bestuursperiod';

export const registerCustomValidations = () => {
  registerCustomValidation(
    'http://mu.semte.ch/vocabularies/ext/ValidRijksregisternummer',
    rijksregisternummerValidation
  );
  registerCustomValidation(
    'http://mu.semte.ch/vocabularies/ext/ValidRangorde',
    isValidRangorde
  );
  registerCustomValidation(
    'http://mu.semte.ch/vocabularies/ext/ValidMandatarisDate',
    isValidMandatarisDate
  );
};
