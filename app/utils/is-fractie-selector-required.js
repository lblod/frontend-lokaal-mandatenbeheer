export async function isRequiredForBestuursorgaan(bestuursorgaan) {
  if (!bestuursorgaan) {
    return false;
  }

  const requiredWhen = [
    await bestuursorgaan.isGR,
    await bestuursorgaan.isCBS,
    await bestuursorgaan.isBurgemeester,
  ];

  return requiredWhen.some((is) => is === true);
}

export async function isDisabledForBestuursorgaan(bestuursorgaanInTijd) {
  if (!bestuursorgaanInTijd) {
    return false;
  }

  const bestuursorgaan = await bestuursorgaanInTijd.isTijdsspecialisatieVan;
  return bestuursorgaan.isPolitieraad;
}
