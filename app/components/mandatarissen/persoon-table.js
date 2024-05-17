import Component from '@glimmer/component';

export default class MandatarissenPersoonTable extends Component {
  async fractiesFor(persoon) {
    const mandatarissen = await persoon.isAangesteldAls;
    const fractieLabels = await Promise.all(
      mandatarissen.map(async (mandataris) => {
        if (!mandataris.isActive) {
          return null;
        }

        const isLidVan = await mandataris.heeftLidmaatschap;
        const binnenFractie = await isLidVan.binnenFractie;
        return binnenFractie ? binnenFractie.naam : null;
      })
    );

    return [...new Set(fractieLabels.filter((label) => label))].join(', ');
  }
}