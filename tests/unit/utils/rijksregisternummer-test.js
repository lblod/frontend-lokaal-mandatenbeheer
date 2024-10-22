import {
  getBirthDate,
  isValidRijksregisternummer,
} from 'frontend-lmb/utils/form-validations/rijksregisternummer';
import { module, test } from 'qunit';

module('Unit | Utils | form-validations | RRN helpers', function () {
  test('06.02.02-000.80 is a valid RRN', function (assert) {
    const rrn = '06020200080';
    assert.true(isValidRijksregisternummer(rrn));
  });
  test('06.02.02-000.80 should return date 2006-02-02', function (assert) {
    const rrn = '06020200080';

    assert.deepEqual(getBirthDate(rrn), '2006-02-02');
  });
});
