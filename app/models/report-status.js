import Model, { attr, belongsTo } from '@ember-data/model';

export default class ReportStatusModel extends Model {
  @attr('datetime') startedAt;
  @attr('datetime') finishedAt;
  @attr('datetime') isFlaggedAsCrashed;

  @belongsTo('report', {
    async: true,
    inverse: null,
  })
  report;
}
