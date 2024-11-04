import Component from '@glimmer/component';

import { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';

import { task } from 'ember-concurrency';
import {
  placeholderNietBeschikbaar,
  placeholderOnafhankelijk,
} from 'frontend-lmb/utils/constants';

export default class DownloadMandatarissenFromTableComponent extends Component {
  @service('mandataris-api') mandatarisApi;
  @tracked downloadLink;

  constructor() {
    super(...arguments);
    this.prepareDownloadLink.perform();
  }

  prepareDownloadLink = task(async () => {
    let boiId = null;
    if (this.args.bestuursorgaan) {
      boiId = await this.getBestuursorgaanInTijdForPeriod();
    }
    this.downloadLink = this.mandatarisApi.getDownLoadUrl({
      bestuursperiodeId: this.args.bestuursperiode?.id,
      activeOnly: this.args.activeOnly,
      bestuursorgaanId: boiId,
      persoonIds: this.persoonIds,
      fractieIds: this.fractieIds,
      hasFilterOnOnafhankelijkeFractie: this.filterOnOnafhankelijkeFractie,
      hasFilterOnNietBeschikbareFractie: this.filterOnNietBeschikbaarFractie,
      bestuursFunctieCodeIds: this.bestuursFunctieCodeIds ?? [],
      sort: this.args.sort,
    });
    return this.downloadLink;
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
    const unknownIds = [
      placeholderNietBeschikbaar.id,
      placeholderOnafhankelijk.id,
    ];
    return this.args.fracties
      ?.map((fractie) => fractie.id)
      .filter((fractieId) => !unknownIds.includes(fractieId));
  }

  get filterOnOnafhankelijkeFractie() {
    const allIds = this.args.fracties?.map((fractie) => fractie.id);
    return allIds?.includes(placeholderOnafhankelijk.id);
  }

  get filterOnNietBeschikbaarFractie() {
    const allIds = this.args.fracties?.map((fractie) => fractie.id);
    return allIds?.includes(placeholderNietBeschikbaar.id);
  }

  get bestuursFunctieCodeIds() {
    return this.args.bestuursFunctieCodes?.map((code) => code.id);
  }
}
