import Component from '@glimmer/component';

export default class MandatarissenPersoonTable extends Component {
  async mandatarissen(persoon) {
    const mandatarissen = await persoon.isAangesteldAls;
    const mandaten = await Promise.all(
      mandatarissen.map(async (mandataris) => {
        console.log(mandataris);
        return await (
          await mandataris.bekleedt
        ).bestuursfunctie;
      })
    );
    console.log(mandaten);
    return mandaten;
  }
}
