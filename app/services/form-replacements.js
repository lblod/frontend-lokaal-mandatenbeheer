import Service from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { JSON_API_TYPE } from 'frontend-lmb/utils/constants';

export default class FormReplacementsService extends Service {
  @tracked formReplacements = null;

  async setup() {
    const result = await fetch(`/form-content/form-replacements`, {
      method: 'GET',
      headers: {
        'Content-Type': JSON_API_TYPE,
      },
    });

    const idReplacements = await result.json();
    const mapping = {};
    for (const replacement of idReplacements.replacements) {
      mapping[replacement.standardId] = replacement.replacementId;
    }
    this.formReplacements = mapping;
  }

  setReplacement(standardId, replacementId) {
    const newFormReplacements = { ...this.formReplacements };
    // maybe the 'standardid' is already a replaced form, let's check the current mapping
    let trueStandardId = standardId;
    for (const [key, value] of Object.entries(this.formReplacements)) {
      if (value === standardId) {
        trueStandardId = key;
      }
    }
    newFormReplacements[trueStandardId] = replacementId;
    this.formReplacements = newFormReplacements;
  }

  getReplacement(standardId) {
    return this.formReplacements[standardId] || standardId;
  }
}
