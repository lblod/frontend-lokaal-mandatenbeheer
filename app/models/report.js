import Model, { attr, hasMany } from '@ember-data/model';

export default class ReportModel extends Model {
  @attr('datetime') created;
  @attr('boolean') conforms;

  @hasMany('validationresult', {
    async: true,
    inverse: null,
  })
  validationresults;
}
