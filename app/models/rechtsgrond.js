import Model, { attr, belongsTo } from '@ember-data/model';

export default class RechtsgrondModel extends Model {
  @attr uri;

  @belongsTo('mandataris', {
    async: true,
    inverse: 'aanstellingBekrachtigdDoor',
    polymorphic: true,
    as: 'rechtsgrond',
  })
  bekrachtigtAanstellingVan;

  @belongsTo('mandataris', {
    async: true,
    inverse: 'ontslagBekrachtigdDoor',
    polymorphic: true,
    as: 'rechtsgrond',
  })
  bekrachtigtOntslagVan;
}
