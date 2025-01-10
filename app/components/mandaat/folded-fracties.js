import Component from '@glimmer/component';

import { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';

import { toUserReadableListing } from 'frontend-lmb/utils/to-user-readable-listing';
import moment from 'moment';
import { task } from 'ember-concurrency';

export default class MandaatFoldedFractiesComponent extends Component {
  @service store;

  @tracked fractiesText = '';

  get persoon() {
    return this.args.persoon;
  }

  get bestuursperiode() {
    return this.args.bestuursperiode;
  }

  get mandaat() {
    return this.args.mandaat;
  }

  constructor(...args) {
    super(...args);
    this.load.perform();
  }

  load = task(async () => {
    const mandatarissen =
      this.args.mandatarissen ?? (await this.getMandatarissen(this.persoon));

    const { latestFracties, allFracties } =
      await this.getFoldedFracties(mandatarissen);

    this.fractiesText = this.fractiesToString(latestFracties, allFracties);
  });

  async getMandatarissen(persoon) {
    const options = {
      filter: {
        'is-bestuurlijke-alias-van': {
          ':id:': persoon.id,
        },
      },
      include: 'heeft-lidmaatschap.binnen-fractie',
    };

    if (this.bestuursperiode) {
      options.filter.bekleedt = {
        'bevat-in': {
          'heeft-bestuursperiode': {
            ':id:': this.bestuursperiode.id,
          },
        },
      };
    }
    // mandaat takes precedence over bestuursperiode since it's more specific
    if (this.mandaat) {
      options.filter.bekleedt = {
        ':id:': this.mandaat.id,
      };
    }
    return await this.store.query('mandataris', options);
  }

  async fractieOrNull(mandataris) {
    const lidmaatschap = await mandataris.heeftLidmaatschap;
    if (!lidmaatschap) {
      return null;
    }
    const fractie = await lidmaatschap.binnenFractie;
    return fractie ? fractie.naam : null;
  }

  async getFoldedFracties(mandatarissen) {
    let latestMandataris = null;
    let latestFracties = new Set();
    const allFracties = new Set();

    await Promise.all(
      mandatarissen.map(async (mandataris) => {
        const fractie = await this.fractieOrNull(mandataris);
        allFracties.add(fractie);

        if (!latestMandataris || mandataris.einde == latestMandataris.einde) {
          latestMandataris = mandataris;
          latestFracties.add(fractie);
        } else if (
          !mandataris.einde ||
          moment(mandataris.einde).isAfter(latestMandataris.einde)
        ) {
          latestMandataris = mandataris;
          latestFracties.clear();
          latestFracties.add(fractie);
        }
      })
    );

    return {
      latestFracties: Array.from(latestFracties),
      allFracties: Array.from(allFracties),
    };
  }

  fractiesToString(latestFracties, allFracties) {
    const currentFracties = latestFracties
      .filter(Boolean)
      .toSorted((a, b) => a.localeCompare(b));
    if (currentFracties.length == 0) {
      return 'Niet beschikbaar';
    }
    const currentFractiesString = currentFracties.join(', ');
    const otherFracties = allFracties
      .filter(Boolean)
      .filter((fractie) => !currentFracties.includes(fractie))
      .filter((fractie) => fractie != 'Onafhankelijk')
      .toSorted((a, b) => a.localeCompare(b));
    return otherFracties.length
      ? `${currentFractiesString} (${toUserReadableListing(otherFracties)})`
      : currentFractiesString;
  }
}
