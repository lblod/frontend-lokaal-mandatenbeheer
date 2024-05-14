export const filter = async (arr, predicate) => {
  const results = await Promise.all(arr.map(predicate));

  return arr.filter((_v, index) => results[index]);
};

export const findFirst = async (arr, predicate) => {
  const results = await Promise.all(arr.map(predicate));

  return arr.find((_v, index) => results[index]);
};
