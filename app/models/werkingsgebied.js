import Model, { attr, hasMany } from '@ember-data/model';

export default class WerkingsgebiedModel extends Model {
  @attr uri;
  @attr naam;
  @attr niveau;

  @hasMany('bestuurseenheid', {
    async: true,
    inverse: 'werkingsgebied',
    polymorphic: true,
    as: 'werkingsgebied',
  })
  bestuurseenheid;

  get longName() {
    return `${this.naam} (${this.niveau})`;
  }

  rdfaBindings = {
    class: 'prov:Location',
    naam: 'rdfs:label',
  };
}
