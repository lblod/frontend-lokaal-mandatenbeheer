import ApiError from './api-error';
import { STATUS_CODE } from './constants';

export const handleResponse = async (response) => {
  const jsonResponse = await response.json();
  if (response.status !== STATUS_CODE.OK) {
    console.error(jsonResponse.message);
    throw new ApiError(jsonResponse.message, response.status);
  }
  return jsonResponse;
};
