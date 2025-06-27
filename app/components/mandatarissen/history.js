import Component from '@glimmer/component';
export default class MandatarisHistoryComponent extends Component {
  get toonBeleidsdomeinen() {
    return this.args.history.some((h) => h.mandataris.beleidsdomein.length > 0);
  }

  get toonRangorde() {
    return this.args.history.some((h) => h.mandataris.rangorde);
  }
}
