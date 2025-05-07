import Component from '@glimmer/component';

import { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { trackedFunction } from 'reactiveweb/function';
import { use } from 'ember-resources';

export default class ValidatieTable extends Component {
  @service validatie;
  @service features;

  @use(getOwnValidationErrors)
  ownValidationErrors;

  @tracked collapsed = true;

  get instance() {
    return this.args.instance;
  }

  get results() {
    return this.ownValidationErrors?.value || [];
  }

  get isFeatureEnabled() {
    return this.features.isEnabled('shacl-report');
  }

  get isLoaded() {
    return !this.ownValidationErrors?.isPending;
  }

  get isValidating() {
    return this.validatie.isRunning;
  }

  @action
  toggleCollapsed() {
    this.collapsed = !this.collapsed;
  }
}

function getOwnValidationErrors() {
  return trackedFunction(async () => {
    return this.validatie.getIssuesForId(this.instance.id);
  });
}
