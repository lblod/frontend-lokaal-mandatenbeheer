import Component from '@glimmer/component';

export default class SharedUnsavedChangesModal extends Component {
  get title() {
    return this.args.title ?? 'Wijzigingen niet opgeslagen';
  }

  get isClosable() {
    return this.args.isClosable ?? true;
  }

  get descriptionText() {
    return (
      this.args.descriptionText ??
      'Je wijzigingen zijn niet opgeslagen en gaan verloren als je verder gaat!'
    );
  }
}
