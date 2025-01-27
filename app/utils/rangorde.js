export const rangordeStringMapping = {
  Eerste: 1,
  Tweede: 2,
  Derde: 3,
  Vierde: 4,
  Vijfde: 5,
  Zesde: 6,
  Zevende: 7,
  Achtste: 8,
  Negende: 9,
  Tiende: 10,
  Elfde: 11,
  Twaalfde: 12,
  Dertiende: 13,
  Veertiende: 14,
  Vijftiende: 15,
  Zestiende: 16,
  Zeventiende: 17,
  Achttiende: 18,
  Negentiende: 19,
  Twintigste: 20,
  Eenentwintigste: 21,
  Tweeëntwintigste: 22,
  Drieëntwintigste: 23,
  Vierentwintigste: 24,
  Vijfentwintigste: 25,
  Zesentwintigste: 26,
  Zevenentwintigste: 27,
  Achtentwintigste: 28,
  Negenentwintigste: 29,
  Dertigste: 30,
  Eenendertigste: 31,
  Tweeëndertigste: 32,
  Drieëndertigste: 33,
  Vierendertigste: 34,
  Vijfendertigste: 35,
  Zesendertigste: 36,
  Zevenendertigste: 37,
  Achtendertigste: 38,
  Negenendertigste: 39,
  Veertigste: 40,
  Eenenveertigste: 41,
  Tweeënveertigste: 42,
  Drieënveertigste: 43,
  Vierenveertigste: 44,
  Vijfenveertigste: 45,
  Zesenveertigste: 46,
  Zevenenveertigste: 47,
  Achtenveertigste: 48,
  Negenenveertigste: 49,
  Vijftigste: 50,
  Eenenvijftigste: 51,
  Tweeënvijftigste: 52,
  Drieënvijftigste: 53,
  Vierenvijftigste: 54,
  Vijfenvijftigste: 55,
  Zesenvijftigste: 56,
  Zevenenvijftigste: 57,
  Achtenvijftigste: 58,
  Negenenvijftigste: 59,
  Zestigste: 60,
  Eenenzestigste: 61,
  Tweeënzestigste: 62,
  Drieënzestigste: 63,
  Vierenzestigste: 64,
  Vijfenzestigste: 65,
  Zesenzestigste: 66,
  Zevenenzestigste: 67,
  Achtenzestigste: 68,
  Negenenzestigste: 69,
  Zeventigste: 70,
  Eenenzeventigste: 71,
  Tweeënzeventigste: 72,
  Drieënzeventigste: 73,
  Vierenzeventigste: 74,
  Vijfenzeventigste: 75,
  Zesenzeventigste: 76,
  Zevenenzeventigste: 77,
  Achtenzeventigste: 78,
  Negenenzeventigste: 79,
  Tachtigste: 80,
  Eenentachtigste: 81,
  Tweeëntachtigste: 82,
  Drieëntachtigste: 83,
  Vierentachtigste: 84,
  Vijfentachtigste: 85,
  Zesentachtigste: 86,
  Zevenentachtigste: 87,
  Achtentachtigste: 88,
  Negenentachtigste: 89,
  Negentigste: 90,
  Eenennegentigste: 91,
  Tweeënnegentigste: 92,
  Drieënnegentigste: 93,
  Vierennegentigste: 94,
  Vijfennegentigste: 95,
  Zesennegentigste: 96,
  Zevenennegentigste: 97,
  Achtennegentigste: 98,
  Negenennegentigste: 99,
  Honderdste: 100,
};

export const rangordeNumberMapping = {};

Object.keys(rangordeStringMapping).forEach((key) => {
  rangordeNumberMapping[rangordeStringMapping[key]] = key;
});

export const rangordeStringToNumber = (rangordeString) => {
  if (!rangordeString) {
    return null;
  }
  const firstWord = rangordeString.split(' ')[0];
  return rangordeStringMapping[firstWord];
};

export const orderMandatarissenByRangorde = (
  mandatarissen,
  allMandatarissenInIv,
  reverse
) => {
  return mandatarissen.sort((a, b) => {
    const classRankA = a.bekleedt.get('bestuursfunctie.rankForSorting');
    const classRankB = b.bekleedt.get('bestuursfunctie.rankForSorting');
    if (classRankA < classRankB) {
      return reverse ? -1 : 1;
    } else if (classRankA > classRankB) {
      return reverse ? 1 : -1;
    }

    const noRangorde = !a.rangorde && !b.rangorde;
    if (noRangorde && allMandatarissenInIv) {
      return fallbackSortByOtherIVOrgans(a, b, allMandatarissenInIv);
    }

    const aNumber = rangordeStringToNumber(a.rangorde);
    const bNumber = rangordeStringToNumber(b.rangorde);
    if (aNumber == null) {
      return reverse ? 1 : -1;
    }
    if (bNumber == null) {
      return reverse ? -1 : 1;
    }
    return reverse ? bNumber - aNumber : aNumber - bNumber;
  });
};

export const orderMandatarisStructByRangorde = (mandatarissen) => {
  return mandatarissen.sort((a, b) => {
    const classRankA = a.mandataris.bekleedt.get(
      'bestuursfunctie.rankForSorting'
    );
    const classRankB = b.mandataris.bekleedt.get(
      'bestuursfunctie.rankForSorting'
    );
    if (classRankA < classRankB) {
      return 1;
    } else if (classRankA > classRankB) {
      return -1;
    }

    const aNumber = rangordeStringToNumber(a.rangorde);
    const bNumber = rangordeStringToNumber(b.rangorde);
    if (aNumber == null) {
      return -1;
    }
    if (bNumber == null) {
      return 1;
    }
    return aNumber - bNumber;
  });
};

const findCorrespondingMandatarisIndex = (mandataris, allMandatarissenInIv) => {
  const correspondingMandateUris = mandataris.bekleedt.get(
    'bestuursfunctie.correspondingMandateCodesIV'
  );
  if (!correspondingMandateUris) {
    // no corresponding mandate found, just return the first index based on absolute authority of all mandatarissen, e.g. useful for bcsd
    return allMandatarissenInIv.findIndex((i) => {
      return (
        i.isBestuurlijkeAliasVan.id == mandataris.isBestuurlijkeAliasVan.id
      );
    });
  }
  // if there are corresponding mandates, find the highest ranking mandataris with such a mandate that has the same person
  return allMandatarissenInIv.findIndex((i) => {
    return (
      correspondingMandateUris.indexOf(i.get('bekleedt.bestuursfunctie.uri')) >=
        0 && i.isBestuurlijkeAliasVan.id == mandataris.isBestuurlijkeAliasVan.id
    );
  });
};

const fallbackSortByOtherIVOrgans = (a, b, allMandatarissenInIv) => {
  // if no person, don't bother, put them at the bottom
  if (!a.isBestuurlijkeAliasVan?.id) {
    return 1;
  }
  if (!b.isBestuurlijkeAliasVan?.id) {
    return -1;
  }

  const rankA = findCorrespondingMandatarisIndex(a, allMandatarissenInIv);
  const rankB = findCorrespondingMandatarisIndex(b, allMandatarissenInIv);
  if (rankA < 0) {
    return 1;
  }
  if (rankB < 0) {
    return -1;
  }
  return rankA - rankB;
};
