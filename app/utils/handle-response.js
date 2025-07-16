import ApiError from './api-error';
import { showErrorToast, showSuccessToast } from './toasts';

export const handleResponse = async ({
  response,
  toaster = null,
  errorMessage = null,
  successMessage = null,
}) => {
  let jsonResponse;
  try {
    jsonResponse = await response.json();
  } catch (e) {
    console.error('Failed to parse JSON response', e);
    const message =
      errorMessage ?? 'Ongeldige JSON respons, probeer later opnieuw.';
    if (toaster) {
      showErrorToast(toaster, message);
      return null;
    } else {
      throw new ApiError(message, response.status ?? 500);
    }
  }

  if (!response.ok) {
    console.error(jsonResponse.message);
    const message = errorMessage ?? jsonResponse.message;
    if (toaster) {
      showErrorToast(toaster, message);
      return null;
    } else {
      throw new ApiError(message, response.status);
    }
  } else if (toaster && successMessage) {
    showSuccessToast(toaster, successMessage);
  }
  return jsonResponse;
};

export const handleResponseSilently = async ({
  response,
  defaultValue = null,
  modifier = null,
}) => {
  let jsonResponse;
  try {
    jsonResponse = await response.json();
  } catch (e) {
    console.error('Failed to parse JSON response', e);
    return defaultValue;
  }
  if (!response.ok) {
    console.error(jsonResponse.message);
    return defaultValue;
  }
  return modifier ? modifier(jsonResponse) : jsonResponse;
};
