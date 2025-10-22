import Component from '@glimmer/component';

export default class MandatarisStatusPillComponent extends Component {
  get isMandatarisBekrachtigd() {
    return this.args.mandataris.get('status')
      ? this.args.mandataris.get('status').get('isBekrachtigd')
      : true;
  }

  get skin() {
    if (this.isBeeindigd && !this.args.detailView) {
      return 'border';
    }
    const label = this.args.mandataris.get('status.label');
    if (!label) {
      return 'error';
    }
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

  get extraText() {
    if (this.args.detailView && this.isBeeindigd) {
      return 'einddatum is verstreken';
    }
    return '';
  }

  get isBeeindigd() {
    if (!this.showStatusDependingOnDate) {
      return false;
    }

    const now = new Date();
    return this.args.mandataris.get('einde')?.getTime() < now.getTime();
  }

  get label() {
    if (this.isBeeindigd && !this.args.detailView) {
      return 'Beëindigd';
    }
    const status = this.args.mandataris.get('status.label');
    const statusText = status || 'Niet beschikbaar';
    return statusText;
  }

  get showStatusDependingOnDate() {
    return this.args.showStatusDependingOnDate !== false;
  }
}
