import Component from '@glimmer/component';

import { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';

import moment from 'moment';
import {
  getDraftPublicationStatus,
  getEffectiefStatus,
} from 'frontend-lmb/utils/get-mandataris-status';
import {
  BESTUURSFUNCTIE_BURGEMEESTER_ID,
  BESTUURSFUNCTIE_VOORZITTER_VAST_BUREAU_ID,
} from 'frontend-lmb/utils/well-known-ids';
import { toUserReadableListing } from 'frontend-lmb/utils/to-user-readable-listing';

export default class MandaatBurgemeesterSelectorComponent extends Component {
  @service toaster;
  @service store;

  @tracked persoon = null;
  @tracked mandataris = null;
  @tracked errorMessages = [];
  // no need to track these
  burgemeesterMandate = null;
  voorzitterVastBureauMandate = null;
  targetMandatarisses = null;

  get bindingStart() {
    return this.args.bestuursorgaanInTijd.bindingStart;
  }

  get bindingEinde() {
    return this.args.bestuursorgaanInTijd.bindingEinde;
  }

  constructor() {
    super(...arguments);
    this.load();
  }

  async load() {
    await this.loadBurgemeesterMandates();

    if ((this.burgemeesterMandate && this, this.voorzitterVastBureauMandate)) {
      this.persoon = await this.loadBurgemeesterPersoon();
    }
  }

  formatToDateString(dateTime) {
    return dateTime ? moment(dateTime).format('YYYY-MM-DD') : undefined;
  }

  async loadBurgemeesterMandates() {
    const bestuursperiode =
      await this.args.bestuursorgaanInTijd.heeftBestuursperiode;
    const mandates = await this.store.query('mandaat', {
      filter: {
        'bevat-in': {
          'heeft-bestuursperiode': {
            id: bestuursperiode.id,
          },
        },
        bestuursfunctie: {
          id: [
            BESTUURSFUNCTIE_BURGEMEESTER_ID,
            BESTUURSFUNCTIE_VOORZITTER_VAST_BUREAU_ID,
          ].join(','),
        },
      },
      include: 'bestuursfunctie',
    });
    this.burgemeesterMandate = this.getMandateForIdFromMandatees(
      BESTUURSFUNCTIE_BURGEMEESTER_ID,
      mandates
    );
    this.voorzitterVastBureauMandate = this.getMandateForIdFromMandatees(
      BESTUURSFUNCTIE_VOORZITTER_VAST_BUREAU_ID,
      mandates
    );
  }

  getMandateForIdFromMandatees(bestuursfunctieId, mandatees) {
    const mapping = {
      [BESTUURSFUNCTIE_BURGEMEESTER_ID]: 'Burgemeester',
      [BESTUURSFUNCTIE_VOORZITTER_VAST_BUREAU_ID]: 'Voorzitter Vast Bureau',
    };

    const burgemeester = mandatees.find((m) => {
      return m.get('bestuursfunctie.id') === bestuursfunctieId;
    });

    if (!burgemeester) {
      this.toaster.notify(
        `Geen ${mapping[bestuursfunctieId] ?? ''} mandaat gevonden.`,
        'Opgelet!',
        { type: 'warning', timeOut: 5000 }
      );
    }

    return burgemeester;
  }

  async setMultipleBurgemeestersError(burgemeesters) {
    const personen = await Promise.all(
      burgemeesters.map((b) => b.isBestuurlijkeAliasVan)
    );
    const mandaatName = burgemeesters[0].get('bekleedt.bestuursfunctie.label');

    this.errorMessages = [
      ...this.errorMessages,
      `Er zijn meerdere personen gevonden met het mandaat ${mandaatName}. Enkel de eerste zal aangepast worden:
      ${toUserReadableListing(personen, (p) => `${p.gebruikteVoornaam} ${p.achternaam}`)}.`,
    ];
  }

  async createMandataris(burgemeesterMandaat) {
    const newMandataris = this.store.createRecord('mandataris', {
      rangorde: null,
      start: this.bindingStart,
      einde: this.bindingEinde,
      bekleedt: burgemeesterMandaat,
      isBestuurlijkeAliasVan: null,
      beleidsdomein: [],
      status: await getEffectiefStatus(this.store),
      publicationStatus: await getDraftPublicationStatus(this.store),
    });
    await newMandataris.save();
    return newMandataris;
  }

  async loadBurgemeesterPersoon() {
    const burgemeesters = await this.burgemeesterMandate.bekleedDoor;
    const voorzitterVastBureau =
      await this.voorzitterVastBureauMandate.bekleedDoor;

    const targetMandatarisses = [];

    if (burgemeesters.length === 0) {
      targetMandatarisses.push(
        await this.createMandataris(this.burgemeesterMandate)
      );
    } else if (burgemeesters.length === 1) {
      targetMandatarisses.push(burgemeesters[0]);
    } else {
      await this.setMultipleBurgemeestersError(burgemeesters);
      targetMandatarisses.push(burgemeesters[0]);
    }
    if (voorzitterVastBureau.length === 0) {
      targetMandatarisses.push(
        await this.createMandataris(this.voorzitterVastBureauMandate)
      );
    } else if (voorzitterVastBureau.length === 1) {
      targetMandatarisses.push(voorzitterVastBureau[0]);
    } else {
      await this.setMultipleBurgemeestersError(voorzitterVastBureau);
      targetMandatarisses.push(voorzitterVastBureau[0]);
    }

    this.targetMandatarisses = targetMandatarisses;

    return burgemeesters[0]?.isBestuurlijkeAliasVan || null;
  }

  @action
  async onUpdate(persoon) {
    if (!persoon) {
      return;
    }

    this.persoon = persoon;
    await Promise.all(
      this.targetMandatarisses.map((target) => {
        target.isBestuurlijkeAliasVan = persoon;
        return target.save();
      })
    );
  }
}
