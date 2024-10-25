export const isValidUri = (inputValue) => {
  // eslint-disable-next-line no-useless-escape, prettier/prettier
  const regex = '^(https?://)[a-zA-Z0-9-]+(.[a-zA-Z0-9-]+)*(/.*)?$';
  const uriRegex = new RegExp(regex);
  return uriRegex.test(inputValue);
};
