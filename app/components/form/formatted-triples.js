import Component from '@glimmer/component';

export default class FormattedTriplesComponent extends Component {
  get formattedTriples() {
    if (!this.args.triples) {
      return '';
    }
    return this.args.triples;
  }
}
