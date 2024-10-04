import Component from '@glimmer/component';

export default class MandatarisStatusPillComponent extends Component {
  get isMandatarisBekrachtigd() {
    return this.args.mandataris.get('status')
      ? this.args.mandataris.get('status').get('isBekrachtigd')
      : true;
  }

  get skin() {
    if (this.isBeeindigd) {
      return 'border';
    }

    const label = this.args.mandataris.get('status.label');
    if (
      ['Effectief', 'Titelvoerend', 'Waarnemend', 'Aangesteld'].indexOf(label) >
      -1
    ) {
      return 'success';
    }
    if (label === 'Verhinderd') {
      return 'warning';
    }
    return 'default';
  }

  get isBeeindigd() {
    const now = new Date();
    return this.args.mandataris.get('einde')?.getTime() < now.getTime();
  }

  get label() {
    const beeindigd = this.isBeeindigd;
    const status = this.args.mandataris.get('status.label');
    const statusText = status || 'Niet beschikbaar';
    if (beeindigd) {
      return `${statusText} (Beeindigd)`;
    }
    return statusText;
  }
}
