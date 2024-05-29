import Controller from '@ember/controller';

import { task } from 'ember-concurrency';

export default class MandatarissenUploadController extends Controller {
  uploadFile = task(async (uploadFile) => {
    console.log(`uploadFile`, uploadFile);
    const response = await uploadFile.upload(
      '/mandataris-api/mandatarissen/upload-csv',
      {
        contentType: 'multipart/form-data',
      }
    );
    // const uploadState: CsvUploadState = {
    //   errors: [],
    //   warnings: [],
    //   personsCreated: 0,
    //   mandatarissenCreated: 0,
    //   beleidsdomeinenCreated: 0,
    //   beleidsDomeinMapping: {},
    // };
    const jsonResponse = await response.json();
    console.log({ jsonResponse });
  });
}
