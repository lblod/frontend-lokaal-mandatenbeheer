import Component from '@glimmer/component';
export default class SharedPersoonPersoonSearchFormComponent extends Component {
  get personText() {
    const person = this.args.person;
    if (!person) {
      return 'Geen persoon geselecteerd';
    }
    return `${person.gebruikteVoornaam} ${person.achternaam}`;
  }

  get personRrn() {
    const person = this.args.person;
    if (!person) {
      return '';
    }
    return person.identificator?.rijksregisternummer || 'Geen RRN bekend';
  }
}
