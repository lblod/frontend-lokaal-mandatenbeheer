import moment from 'moment';

export const foldMandatarisses = async (params, mandatarisses, validatie) => {
  return sort(params, await fold(mandatarisses, validatie));
};

export async function fold(mandatarissen, validatie) {
  // 'persoonId-mandaatId' to foldedMandataris
  const persoonMandaatData = {};
  const validationResults =
    await validatie.latestValidationReport?.validationresults;
  await Promise.all(
    mandatarissen.map(async (mandataris) => {
      const personId = (await mandataris.isBestuurlijkeAliasVan).id;
      const mandaatId = (await mandataris.bekleedt).id;
      const key = `${personId}-${mandaatId}`;
      const existing = persoonMandaatData[key];

      if (existing) {
        updateFoldedMandataris(mandataris, existing, validationResults);
        return;
      }
      persoonMandaatData[key] = buildFoldedMandataris(
        mandataris,
        validationResults
      );
    })
  );
  return Object.values(persoonMandaatData).map(
    ({ foldedStart, foldedEnd, mandataris, validationErrors }) => {
      return {
        foldedStart,
        foldedEnd,
        mandataris,
        validationErrors,
      };
    }
  );
}

function sort(params, mandatarissen) {
  const needsResort = [
    'start',
    'einde',
    'status.label',
    'heeft-lidmaatschap.binnen-fractie.naam',
  ].find((resortKey) => {
    return params?.sort?.includes(resortKey);
  });
  if (!params?.sort || !needsResort) {
    // can trust api to have sorted properly since we haven't recombined these fields in a possibly destructive way
    return mandatarissen;
  }

  const getValue = (folded, key) => {
    if (key.indexOf('heeft-lidmaatschap.binnen-fractie.naam') >= 0) {
      return folded.mandataris.get('heeftLidmaatschap.binnenFractie.naam');
    }
    if (key.indexOf('start') >= 0) {
      return (
        folded.foldedStart && moment(folded.foldedStart).format('YYYY-MM-DD')
      );
    }
    if (key.indexOf('einde') >= 0) {
      return folded.foldedEnd && moment(folded.foldedEnd).format('YYYY-MM-DD');
    }
    if (key.indexOf('status.label') >= 0) {
      if (folded.foldedEnd && moment(folded.foldedEnd).isBefore(moment())) {
        return 'Beëindigd';
      }
      return folded.mandataris.get('status.label') || 'Niet beschikbaar';
    }
    return null;
  };

  return mandatarissen.sort((a, b) => {
    const aVal = getValue(a, params.sort);
    const bVal = getValue(b, params.sort);
    if (aVal === bVal) {
      return 0;
    }
    let result = 0;
    if (aVal === null) {
      result = 1;
    }
    if (bVal === null) {
      result = -1;
    }
    if (aVal > bVal) {
      result = 1;
    } else {
      result = -1;
    }

    if (params.sort.indexOf('-') === 0) {
      return result * -1;
    }
    return result;
  });
}

function updateFoldedMandataris(
  mandataris,
  foldedMandataris,
  validationResults
) {
  updateFoldedStart(mandataris, foldedMandataris);
  updateFoldedEnd(mandataris, foldedMandataris);
  updateMandataris(mandataris, foldedMandataris);
  if (validationResults && !foldedMandataris.validationErrors) {
    const hasIssues = !!validationResults.find(
      (i) => i.focusNodeId === mandataris.id
    );
    if (hasIssues) {
      foldedMandataris.validationErrors = true;
    }
  }
}

function buildFoldedMandataris(mandataris, validationResults) {
  let validationErrors = false;
  if (validationResults) {
    validationErrors = !!validationResults.find(
      (i) => i.focusNodeId === mandataris.id
    );
  }
  return {
    foldedStart: mandataris.start,
    foldedEnd: mandataris.displayEinde,
    validationErrors,
    mandataris,
  };
}

function updateFoldedStart(mandataris, foldedMandataris) {
  if (!mandataris.start || !foldedMandataris.foldedStart) {
    foldedMandataris.foldedStart = null;
  } else {
    foldedMandataris.foldedStart = moment.min(
      moment(foldedMandataris.foldedStart),
      moment(mandataris.start)
    );
  }
}

function updateFoldedEnd(mandataris, foldedMandataris) {
  if (!mandataris.einde || !foldedMandataris.foldedEnd) {
    foldedMandataris.foldedEnd = null;
  } else {
    foldedMandataris.foldedEnd = moment.max(
      moment(foldedMandataris.foldedEnd),
      moment(mandataris.displayEinde)
    );
  }
}

function updateMandataris(mandataris, foldedMandataris) {
  // Keep the one with the latest end date. If the end date is null,
  // we assume this is the latest one.
  if (
    moment(mandataris.displayEinde).isSame(foldedMandataris.foldedEnd) ||
    !mandataris.einde
  ) {
    foldedMandataris.mandataris = mandataris;
  }
}
