import Controller from '@ember/controller';

import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency';

export default class MandatarissenUploadController extends Controller {
  @tracked isFileUploaded;
  @tracked isDetailExpanded;
  @tracked uploadedFile;
  @tracked fileDetails;

  uploadFile = task(async (uploadFile) => {
    this.isFileUploaded = false;
    this.fileDetails = null;
    try {
      const response = await uploadFile.upload(
        '/mandataris-api/mandatarissen/upload-csv',
        {
          contentType: 'multipart/form-data',
        }
      );

      this.fileDetails = await response.json();
      this.uploadedFile = uploadFile;
      this.isFileUploaded = true;
    } catch (error) {
      this.isFileUploaded = false;
      this.fileDetails = null;
    }
  });

  mapErrorsOrWarnings(stringArray) {
    const lineRegex = new RegExp(/\[line (\d+)\]/);
    const messageRegex = new RegExp(/\[line \d+\] (.+)/);
    return stringArray.map((stringValue) => {
      const lineMatch = stringValue.match(lineRegex);
      const messageMatch = stringValue.match(messageRegex);

      return {
        line: lineMatch ? lineMatch[0] : '',
        message: messageMatch ? messageMatch[1] : stringValue,
      };
    });
  }

  get file() {
    const pills = [];

    if (this.fileDetails.errors.length >= 1) {
      pills.push({
        label: 'error',
        skin: 'error',
        icon: 'cross',
      });
    }
    if (this.fileDetails.warnings.length >= 1) {
      pills.push({
        label: 'warning',
        skin: 'warning',
        icon: 'alert-triangle',
      });
    }

    return {
      name: this.uploadedFile.name,
      status: this.fileDetails.status,
      hasWarnings: this.fileDetails.warnings.length >= 1,
      hasErrors: this.fileDetails.errors.length >= 1,
      errors: this.mapErrorsOrWarnings(this.fileDetails.errors),
      warnings: this.mapErrorsOrWarnings(this.fileDetails.warnings),
      pills: pills,
      createdPersons: this.fileDetails.personsCreated,
      createdMandatarissen: this.fileDetails.mandatarissenCreated,
      createdBeleidsdomeinen: this.fileDetails.beleidsdomeinenCreated,
    };
  }
}
