import Component from '@glimmer/component';

export default class MandatarisHistoryRowComponent extends Component {
  get beleidsdomeinCount() {
    return this.args.mandataris.beleidsdomein.length;
  }

  get sortedCorrections() {
    return this.args.corrections.sort((a, b) => {
      return a.issued < b.issued ? 1 : -1;
    });
  }

  get currentVersion() {
    return this.sortedCorrections?.[0];
  }

  get correctionVersions() {
    // we don't repeat the created version if it's the only one
    if (this.sortedCorrections.length < 2) {
      return [];
    }
    return this.sortedCorrections;
  }

  get correctionColspan() {
    const max = 6;
    let colspan = max;
    if (!this.args.toonBeleidsdomeinen) {
      colspan--;
    }
    if (!this.args.toonRangorde) {
      colspan--;
    }
    return colspan;
  }
}
