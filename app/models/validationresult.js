import Model, { attr } from '@ember-data/model';

export default class ValidationresultModel extends Model {
  @attr('string') focusNode;
  @attr('string') resultSeverity;
  @attr('string') sourceConstraintComponent;
  @attr('string') sourceShape;
  @attr('string') resultMessage;
  @attr('string') resultPath;
  @attr('string') value;
  @attr('string') targetClassOfFocusNode;
}
