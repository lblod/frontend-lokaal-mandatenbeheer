import Component from '@glimmer/component';

import { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';

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

    const { latestFracties, allFracties, kieslijst } =
      await this.getFoldedFracties(mandatarissen);

    this.fractiesText = this.fractiesToString(
      latestFracties,
      allFracties,
      kieslijst
    );
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
    return fractie;
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
          (latestMandataris.einde &&
            moment(mandataris.einde).isAfter(latestMandataris.einde))
        ) {
          latestMandataris = mandataris;
          latestFracties.clear();
          latestFracties.add(fractie);
        }
      })
    );
    let kieslijst = null;
    if (
      [...latestFracties].find((fractie) => fractie?.naam === 'Onafhankelijk')
    ) {
      const kieslijsten = await Promise.all(
        [...allFracties].map((fractie) => {
          return fractie.origineleKandidatenlijst;
        })
      );
      kieslijst = kieslijsten.find(
        (kieslijst) => kieslijst && kieslijst.lijstnaam
      );
    }
    return {
      latestFracties: Array.from(latestFracties).map(
        (fractie) => fractie?.naam
      ),
      allFracties: Array.from(allFracties).map((fractie) => fractie?.naam),
      kieslijst,
    };
  }

  fractiesToString(latestFracties, allFracties, kieslijst) {
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
      ? `${currentFractiesString}${kieslijst ? ' (verkozen op ' + kieslijst.lijstnaam + ')' : ''}`
      : currentFractiesString;
  }
}
