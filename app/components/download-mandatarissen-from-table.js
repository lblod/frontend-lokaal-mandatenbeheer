import Component from '@glimmer/component';

import { service } from '@ember/service';

import {
  placeholderNietBeschikbaar,
  placeholderOnafhankelijk,
} from 'frontend-lmb/utils/constants';

export default class DownloadMandatarissenFromTableComponent extends Component {
  @service('mandataris-api') mandatarisApi;

  get downloadLink() {
    return this.mandatarisApi.getDownLoadUrl({
      bestuursperiodeId: this.args.bestuursperiode?.id,
      activeOnly: this.args.activeOnly,
      bestuursorgaanId: this.args.bestuursorgaanInTijdId ?? null,
      persoonIds: this.persoonIds,
      fractieIds: this.fractieIds,
      hasFilterOnOnafhankelijkeFractie: this.filterOnOnafhankelijkeFractie,
      hasFilterOnNietBeschikbareFractie: this.filterOnNietBeschikbaarFractie,
      bestuursFunctieCodeIds: this.bestuursFunctieCodeIds ?? [],
      sort: this.args.sort,
    });
  }

  get persoonIds() {
    return this.args.persoonIds || [];
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
