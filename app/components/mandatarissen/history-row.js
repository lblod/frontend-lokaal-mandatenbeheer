import Component from '@glimmer/component';

export default class MandatarisHistoryRowComponent extends Component {
  get userName() {
    if (!this.args.historyItem.creator) {
      return 'Onbekend';
    }
    return `${this.args.historyItem.creator.voornaam} ${this.args.historyItem.creator.achternaam}`;
  }

  get description() {
    return this.args.historyItem.description || 'Gecorrigeerd';
  }
}
