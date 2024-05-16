export const getByUri = async (store, type, uri, options = {}) => {
  if (!uri) {
    return null;
  }
  const queryOptions = {
    filter: {
      ':uri:': uri,
    },
    ...options,
  };
  const results = await store.query(type, queryOptions);
  return results.length > 0 ? results[0] : null;
};
