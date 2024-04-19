import Model, { attr, belongsTo, hasMany } from '@ember-data/model';

export default class PersoonModel extends Model {
  @attr verifiedMandaten;
  @attr achternaam;
  @attr alternatieveNaam;
  @attr gebruikteVoornaam;
  @attr uri;
  @attr('boolean') possibleDuplicate;
  @attr('datetime', {
    defaultValue() {
      return new Date();
    },
  })
  modified;

  @belongsTo('geboorte', {
    async: true,
    inverse: null,
  })
  geboorte;

  @belongsTo('identificator', {
    async: true,
    inverse: null,
  })
  identificator;

  @belongsTo('geslacht-code', {
    async: true,
    inverse: null,
  })
  geslacht;

  @hasMany('nationality', {
    async: true,
    inverse: null,
  })
  nationalities;

  @hasMany('mandataris', {
    async: true,
    inverse: 'isBestuurlijkeAliasVan',
  })
  isAangesteldAls;
}
