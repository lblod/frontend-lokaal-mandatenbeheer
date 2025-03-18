import ApiError from './api-error';
import { showErrorToast, showSuccessToast } from './toasts';

export const handleResponse = async (response) => {
  const jsonResponse = await response.json();
  if (!response.ok) {
    console.error(jsonResponse.message);
    throw new ApiError(jsonResponse.message, response.status);
  }
  return jsonResponse;
};

export const handleResponseWithToast = async (
  response,
  toaster,
  successMessage
) => {
  const jsonResponse = await response.json();
  if (!response.ok) {
    showErrorToast(toaster, jsonResponse.message);
  } else {
    showSuccessToast(toaster, successMessage);
  }
  return jsonResponse;
};
