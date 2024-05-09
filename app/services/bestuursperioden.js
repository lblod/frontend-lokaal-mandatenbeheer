import Service from '@ember/service';
import { inject as service } from '@ember/service';

export default class BestuursperiodenService extends Service {
  @service store;

  async getRelevantTijdsspecialisaties(bestuursperiode) {
    const tijdsspecialisaties =
      await bestuursperiode.heeftBestuursorganenInTijd;
    const filtered = (
      await Promise.all(
        tijdsspecialisaties.map(async (orgaan) => ({
          value: orgaan,
          valid: await orgaan.containsPoliticalMandates,
        }))
      )
    )
      .filter((v) => v.valid)
      .map((data) => data.value);
    return filtered;
  }
}
