export const queryRecord = async (store, modelName, options) => {
  const result = await store.query(modelName, {
    page: { size: 1 },
    ...options,
  });
  return result.length ? result[0] : null;
};
