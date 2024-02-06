const loadForm = async (
  { formTtl, metaTtl },
  store,
  sourceTtl,
  { formGraph, metaGraph, sourceGraph }
) => {
  store.parse(formTtl, formGraph, 'text/turtle');
  store.parse(metaTtl || '', metaGraph, 'text/turtle');
  store.parse(sourceTtl || '', sourceGraph, 'text/turtle');
};

export { loadForm };
