export async function effectiefIsLastPublicationStatus(mandataris) {
  const mandaat = await mandataris.bekleedt;
  const bestuursorganen = await mandaat.bevatIn;
  const boi = bestuursorganen?.at(0);

  return !!boi?.isVastBureau || boi?.isRMW;
}
