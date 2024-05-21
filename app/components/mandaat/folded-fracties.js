import Component from '@glimmer/component';
import { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { toUserReadableListing } from 'frontend-lmb/utils/to-user-readable-listing';
import moment from 'moment';

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
    this.load();
  }

  async load() {
    const mandatarissen = await this.getMandatarissen(this.persoon);

    const { currentFractie, allFracties } =
      await this.getFoldedFracties(mandatarissen);

    this.fractiesText = this.fractiesToString(currentFractie, allFracties);
  }

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

  // Using EmberData get returns undefined even if the relation is loaded
  async fractieOrNull(mandataris) {
    const lidmaatschap = await mandataris.heeftLidmaatschap;
    return lidmaatschap ? (await lidmaatschap.binnenFractie).naam : null;
  }

  async getFoldedFracties(mandatarissen) {
    let latestMandataris = null;
    const allFracties = new Set();

    await Promise.all(
      mandatarissen.map(async (mandataris) => {
        const fractie = await this.fractieOrNull(mandataris);
        allFracties.add(fractie);

        if (
          !latestMandataris ||
          moment(mandataris.einde).isAfter(latestMandataris.einde) ||
          !mandataris.einde
        ) {
          latestMandataris = mandataris;
        }
      })
    );

    const fractieOrNull = await this.fractieOrNull(latestMandataris);
    const currentFractie = fractieOrNull ? fractieOrNull : 'Onafhankelijk';

    return { currentFractie, allFracties: Array.from(allFracties) };
  }

  fractiesToString(currentFractie, allFracties) {
    const otherFracties = allFracties
      .filter(Boolean)
      .filter((fractie) => fractie !== currentFractie)
      .toSorted((a, b) => a.localeCompare(b));
    return otherFracties.length
      ? `${currentFractie} (${toUserReadableListing(otherFracties)})`
      : currentFractie;
  }
}
