import Model, { attr } from '@ember-data/model';

export default class FeatureFlagModel extends Model {
  @attr('string') name;
  @attr('string') label;
  @attr('string') description;
  @attr('boolean') isEnabled;

  get isActive() {
    return Boolean(this.isEnabled);
  }
}
