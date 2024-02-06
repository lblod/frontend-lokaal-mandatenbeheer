const loadFormInto = async (
  store,
  { formTtl, metaTtl },
  sourceTtl,
  { formGraph, metaGraph, sourceGraph }
) => {
  store.parse(formTtl, formGraph, 'text/turtle');
  store.parse(metaTtl || '', metaGraph, 'text/turtle');
  store.parse(sourceTtl || '', sourceGraph, 'text/turtle');
};

export { loadFormInto };
