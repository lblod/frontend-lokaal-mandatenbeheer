import { getBestuursorgaanClassificaties } from '../form-context/application-context-meta-ttl';

export const isRequiredWhenBestuursorgaanInList = ([inputValue], options) => {
  const { isGR, isCBS, isBurgemeester } =
    getBestuursorgaanClassificaties(options);
  const requiredConditions = [isGR, isCBS, isBurgemeester];

  // Check if a value for the field is required by check the classification of the current bestuursorgaan
  // When an input value is set it is always VALID
  // No input value set, we need to check if the field is required in the bestuursorgaan
  return inputValue || !requiredConditions.some((is) => is === true);
};
