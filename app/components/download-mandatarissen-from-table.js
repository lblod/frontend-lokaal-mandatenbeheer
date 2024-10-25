import Component from '@glimmer/component';

import { service } from '@ember/service';

import { task } from 'ember-concurrency';

export default class DownloadMandatarissenFromTableComponent extends Component {
  @service('mandataris-api') mandatarisApi;

  download = task(async () => {
    let boiId = null;
    if (this.args.bestuursorgaan) {
      boiId = await this.getBestuursorgaanInTijdForPeriod();
    }

    await this.mandatarisApi.downloadAsCsv({
      bestuursperiodeId: this.args.bestuursperiode?.id,
      activeOnly: this.args.activeOnly,
      bestuursorgaanId: boiId,
      persoonIds: this.persoonIds,
      fractieIds: this.fractieIds,
      bestuursFunctieCodeIds: this.bestuursFunctieCodeIds ?? [],
      sort: this.args.sort,
    });
  });

  async getBestuursorgaanInTijdForPeriod() {
    const bestuursorganenInTijdFromPeriod =
      (await this.args.bestuursperiode.heeftBestuursorganenInTijd) ?? [];
    const bestuursorganenInTijd =
      (await this.args.bestuursorgaan?.heeftTijdsspecialisaties) ?? [];

    const fromPeriodIds = bestuursorganenInTijdFromPeriod.map((boi) => boi.id);
    const boiIds = bestuursorganenInTijd.map((boi) => boi.id);
    const boiInPeriod = boiIds.filter((id) => fromPeriodIds.includes(id));
    if (boiInPeriod.length >= 1) {
      return boiInPeriod.at(0);
    }

    return null;
  }

  get persoonIds() {
    return this.args.personen?.map((persoon) => persoon.id);
  }

  get fractieIds() {
    return this.args.fracties?.map((fractie) => fractie.id);
  }

  get bestuursFunctieCodeIds() {
    return this.args.bestuursFunctieCodes?.map((code) => code.id);
  }
}
