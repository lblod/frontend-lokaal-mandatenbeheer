import { isValidUri } from '../is-valid-uri';

export function isValidUrl([inputValue]) {
  if (!inputValue) {
    return true;
  }

  return isValidUri(inputValue);
}
