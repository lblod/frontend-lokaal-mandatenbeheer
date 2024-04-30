import Component from '@glimmer/component';
export default class SharedPersoonPersoonSearchFormComponent extends Component {
  get personText() {
    const person = this.args.person;
    if (!person) {
      return 'Geen persoon geselecteerd';
    }
    return `${person.get('gebruikteVoornaam')} ${person.get('achternaam')}`;
  }
}
