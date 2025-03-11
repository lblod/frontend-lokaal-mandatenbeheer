export const areConceptLabelsValid = (concepten, minCharacters = 1) => {
  return concepten.every((concept) => {
    if (!concept.label) {
      return false;
    }
    if (concept.label.trim() === '') {
      return false;
    }

    return concept.label.trim().length >= minCharacters;
  });
};
