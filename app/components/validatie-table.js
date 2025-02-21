import Component from '@glimmer/component';

import { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';

import { task } from 'ember-concurrency';

export default class ValidatieTable extends Component {
  @service validatie;
  @service features;

  @tracked results;
  @tracked isLoaded = false;

  get instance() {
    return this.args.instance;
  }

  get isFeatureEnabled() {
    return this.features.isEnabled('shacl-report');
  }

  constructor(...args) {
    super(...args);
    this.getResults.perform();
  }

  getResults = task(async () => {
    this.results =
      (await this.validatie.getResultsByInstance(this.instance)) ?? [];
    this.isLoaded = true;
  });
}
