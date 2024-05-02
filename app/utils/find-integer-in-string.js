export function findIntegerInString(stringvalue) {
  if (!stringvalue) {
    return null;
  }

  const firstWord = findFirstWordOfString(stringvalue);
  if (!firstWord) {
    return null;
  }

  const lowercaseWord = firstWord.input?.toLowerCase();
  if (Object.keys(mapping()).includes(lowercaseWord)) {
    return mapping()[lowercaseWord];
  } else {
    return parseInt(lowercaseWord);
  }
}

function findFirstWordOfString(string) {
  // eslint-disable-next-line no-useless-escape
  const regex = new RegExp(/^([\w\-]+)/);
  if (regex.test(string)) {
    return `${string}`.match(regex);
  }
  return null;
}

function mapping() {
  return {
    eerste: 1,
    tweede: 2,
    derde: 3,
    vierde: 4,
    vijfde: 5,
    zesde: 6,
    zevende: 7,
    achtste: 8,
    negende: 9,
    tiende: 10,
    elfde: 11,
    twaalfde: 12,
    dertiende: 13,
    veertiende: 14,
    vijftiende: 15,
    zestiende: 16,
    zeventiende: 17,
    achtiende: 18,
    negentiende: 19,
    twintigste: 20,
  };
}
