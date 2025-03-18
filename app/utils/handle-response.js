import ApiError from './api-error';

export const handleResponse = async (response) => {
  const jsonResponse = await response.json();
  if (!response.ok) {
    console.error(jsonResponse.message);
    throw new ApiError(jsonResponse.message, response.status);
  }
  return jsonResponse;
};
