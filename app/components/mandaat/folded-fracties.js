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
    return await this.store.query('mandataris', {
      filter: {
        'is-bestuurlijke-alias-van': {
          ':id:': persoon.id,
        },
        bekleedt: {
          'bevat-in': {
            'heeft-bestuursperiode': {
              ':id:': this.bestuursperiode.id,
            },
          },
        },
      },
      include: 'heeft-lidmaatschap.binnen-fractie',
    });
  }

  async getFoldedFracties(mandatarissen) {
    let latestMandataris = null;
    const allFracties = new Set();

    await Promise.all(
      mandatarissen.map(async (mandataris) => {
        const fractie = mandataris.get('heeftLidmaatschap.binnenFractie.naam');
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

    const currentFractie = latestMandataris.get(
      'heeftLidmaatschap.binnenFractie.naam'
    );

    return { currentFractie, allFracties: Array.from(allFracties) };
  }

  fractiesToString(currentFractie, allFracties) {
    const otherFracties = allFracties
      .filter((f) => f != currentFractie && f) // TODO the "!=" and "&& f" are confusing
      .toSorted((a, b) => a.localeCompare(b));
    return otherFracties.length
      ? `${currentFractie} (${toUserReadableListing(otherFracties)})`
      : currentFractie;
  }
}
