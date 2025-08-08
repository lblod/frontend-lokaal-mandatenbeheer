import Model, { attr, belongsTo } from '@ember-data/model';

export default class SilencedValidationModel extends Model {
  @attr('string') uri;
  @attr('string') validationKey;
  @attr('string') focusNodeId;
  @attr('string') sourceShape;
  @attr('datetime') silencedAt;

  @belongsTo('bestuurseenheid', {
    async: true,
    inverse: null,
  })
  bestuurseenheid;
}

SilencedValidationModel.buildKey = (validationResult) => {
  return `${validationResult.focusNodeId}${validationResult.value}${validationResult.resultMessage}`;
};
