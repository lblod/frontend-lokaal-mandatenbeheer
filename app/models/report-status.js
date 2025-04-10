import Model, { attr, belongsTo } from '@ember-data/model';

export default class ReportStatusModel extends Model {
  @attr('datetime') startedAt;
  @attr('datetime') finishedAt;

  @belongsTo('report', {
    async: true,
    inverse: null,
  })
  report;

  get isRunning() {
    return this.startedAt && !this.finishedAt;
  }
}
