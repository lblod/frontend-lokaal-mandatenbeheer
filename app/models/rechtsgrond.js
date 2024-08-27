import Model, { attr } from '@ember-data/model';

export default class RechtsgrondModel extends Model {
  @attr uri;
  @attr bekrachtigtAanstellingVan;
  @attr bekrachtigtOntslagVan;
}
