export const isValidUri = (inputValue) => {
  try {
    return ['http:', 'https:', 'mailto:'].includes(
      new URL(inputValue).protocol
    );
  } catch {
    return false;
  }
};
