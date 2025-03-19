import ApiError from './api-error';
import { showErrorToast, showSuccessToast } from './toasts';

export const handleResponse = async (response, errorMessage = null) => {
  let jsonResponse;
  try {
    jsonResponse = await response.json();
  } catch (e) {
    console.error('Failed to parse JSON response', e);
    throw new ApiError(
      'Ongeldige JSON respons, probeer later opnieuw.',
      response.status ?? 500
    );
  }
  if (!response.ok) {
    console.error(jsonResponse.message);
    const message = errorMessage ? errorMessage : jsonResponse.message;
    throw new ApiError(message, response.status);
  }
  return jsonResponse;
};

export const handleResponseSilently = async (response) => {
  let jsonResponse;
  try {
    jsonResponse = await response.json();
  } catch (e) {
    console.error('Failed to parse JSON response', e);
    return false;
  }
  if (!response.ok) {
    console.error(jsonResponse.message);
    return false;
  }
  return jsonResponse;
};

export const handleResponseWithDefault = async (
  response,
  functionCall,
  defaultValue
) => {
  // TODO sometimes response has no json!
  const jsonResponse = await response.json();
  if (!response.ok) {
    console.error(jsonResponse.message);
    return defaultValue;
  }
  return functionCall(jsonResponse);
};

export const handleResponseWithToast = async (
  response,
  toaster,
  errorMessage = null,
  successMessage = null
) => {
  const jsonResponse = await response.json();
  if (!response.ok) {
    const message = errorMessage ? errorMessage : jsonResponse.message;
    showErrorToast(toaster, message);
  } else if (successMessage) {
    showSuccessToast(toaster, successMessage);
  }
  return jsonResponse;
};
