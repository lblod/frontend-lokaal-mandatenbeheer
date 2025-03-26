import { registerCustomValidation } from '@lblod/submission-form-helpers';
import { rijksregisternummerValidation } from './rijksregisternummer';
import { isValidRangorde } from './mandataris-rangorde';
import { isValidMandatarisDate } from './mandataris-date-in-bestuursperiod';
import { isRequiredWhenBestuursorgaanInList } from './required-constraint-for-bestuursorganen';
import { greaterThan } from './greater-than';

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
  registerCustomValidation(
    'http://mu.semte.ch/vocabularies/ext/RequiredForBestuursorganen',
    isRequiredWhenBestuursorgaanInList
  );
  registerCustomValidation(
    'http://mu.semte.ch/vocabularies/ext/GreaterThan',
    greaterThan
  );
};
