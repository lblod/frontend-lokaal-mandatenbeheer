import Component from '@glimmer/component';
import { inject as service } from '@ember/service';

export default class MandatarissenPersoonTable extends Component {
  @service router;

  async mandaten(persoon) {
    const mandatarissen = await persoon.isAangesteldAls;
    const mandaten = await Promise.all(
      mandatarissen.map(async (mandataris) => {
        return (await (await mandataris.bekleedt).bestuursfunctie).label;
      })
    );
    const displayMandaten = [...new Set(mandaten)].join(', ');
    return displayMandaten;
  }
}
