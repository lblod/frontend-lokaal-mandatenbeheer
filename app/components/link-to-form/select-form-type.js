import Component from '@glimmer/component';

import { action } from '@ember/object';
import { cached } from '@glimmer/tracking';

import { API } from 'frontend-lmb/utils/constants';

import { trackedFunction } from 'reactiveweb/function';
import { use } from 'ember-resources';

function getFormTypes() {
  return trackedFunction(async () => {
    const options = [];
    const response = await fetch(
      `${API.FORM_CONTENT_SERVICE}/custom-form/form-type-options`
    );
    if (!response.ok) {
      console.error('Er ging iets mis bij het ophalen van de formulier types');
      return [];
    }
    const formTypes = await response.json();
    const formTypesWithoutSelf = formTypes.customTypes.filter(
      (t) => t.id !== this.args.formDefintionId
    );
    if (formTypesWithoutSelf.length >= 1) {
      options.push(
        ...formTypesWithoutSelf.map((o) => {
          return {
            ...o,
            isCustomType: true,
          };
        })
      );
    }
    options.push(
      ...formTypes.defaultTypes.map((o) => {
        return {
          ...o,
          isDefaultType: true,
        };
      })
    );
    return options;
  });
}
export default class LinkToFormSelectFormType extends Component {
  @use(getFormTypes) getFormTypes;

  @cached
  get formTypes() {
    return this.getFormTypes?.value || [];
  }

  get groupedFormTypes() {
    const options = [];
    const customTypes = this.formTypes.filter((t) => t.isCustomType);
    if (customTypes.length >= 1) {
      options.push({
        groupName: 'Eigen types',
        options: customTypes,
      });
    }
    return [
      ...options,
      {
        groupName: 'Standaard types',
        options: this.formTypes.filter((t) => t.isDefaultType),
      },
    ];
  }

  get selectedFormType() {
    if (!this.args.selectedFormTypeUri) {
      return null;
    }

    return this.formTypes.find(
      (type) => type.uri === this.args.selectedFormTypeUri
    );
  }

  @action
  updateFormType(formTypeOption) {
    this.args.onSelectedType?.(formTypeOption.uri);
  }
}
