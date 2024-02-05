import { registerFormFields } from '@lblod/ember-submission-form-fields';
import RdfInstanceSelectorComponent from 'frontend-lmb/components/rdf-input-fields/instance-selector';
import RdfInstanceMultiSelectorComponent from 'frontend-lmb/components/rdf-input-fields/instance-multi-selector';
import RDFAddressSelectorComponent from 'frontend-lmb/components/rdf-input-fields/address-selector';
import RDFPersonSelectorComponent from 'frontend-lmb/components/rdf-input-fields/person-selector';

export const registerCustomFormFields = () => {
  registerFormFields([
    {
      displayType: 'http://lblod.data.gift/display-types/instanceSelector',
      edit: RdfInstanceSelectorComponent,
    },
    {
      displayType: 'http://lblod.data.gift/display-types/instanceMultiSelector',
      edit: RdfInstanceMultiSelectorComponent,
    },
    {
      displayType: 'http://lblod.data.gift/display-types/addressSelector',
      edit: RDFAddressSelectorComponent,
    },
    {
      displayType: 'http://lblod.data.gift/display-types/personSelector',
      edit: RDFPersonSelectorComponent,
    },
  ]);
};
