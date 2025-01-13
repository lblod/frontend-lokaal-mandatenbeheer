import Component from '@glimmer/component';

import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { service } from '@ember/service';

import { task } from 'ember-concurrency';
import { ForkingStore } from '@lblod/ember-submission-form-fields';
import { consume } from 'ember-provide-consume-context';

export default class CustomFormFieldsTelephoneInputComponent extends Component {}
