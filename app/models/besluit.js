import Model, { attr } from '@ember-data/model';

export default class BesluitModel extends Model {
  @attr uri;
  @attr beschrijving;
  @attr citeeropschrift;
  @attr('language-string') motivering;
  @attr('date') publicatiedatum;
  @attr inhoud;
  @attr taal;
  @attr titel;
  @attr score;

  // TODO: models are not defined in our project
  // @belongsTo('behandeling-van-agendapunt', {
  //   async: true,
  //   inverse: 'besluiten',
  // })
  // volgendUitBehandelingVanAgendapunt;
  // @hasMany('published-resource', { async: true, inverse: null }) publications;
}
