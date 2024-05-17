export const toUserReadableListing = (
  array,
  itemToString = (item) => item,
  prefix = '',
  postfix = ''
) => {
  if (array.length === 0) {
    return '';
  }

  const safeItemToString = (item) => {
    const stringified = itemToString(item);

    if (stringified == null) {
      throw new Error('itemToString should not return null or undefined');
    }
    return stringified;
  };

  const content =
    array.length === 1
      ? safeItemToString(array[0])
      : `${array
          .slice(0, -1)
          .map((p) => safeItemToString(p))
          .join(', ')} en ${safeItemToString(array.at(-1))}`;

  return `${prefix}${content}${postfix}`;
};
