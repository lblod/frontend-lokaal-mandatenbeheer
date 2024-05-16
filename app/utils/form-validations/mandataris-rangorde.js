import { rangordeStringToNumber } from '../rangorde';

export const isValidRangorde = (rangorde) => {
  return rangordeStringToNumber(rangorde?.value) != null;
};
