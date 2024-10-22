import {
  getBirthDate,
  getBirthDay,
  getBirthMonth,
  getBirthYear,
  isValidRijksregisternummer,
  parse,
} from 'frontend-lmb/utils/form-validations/rijksregisternummer';
import { module, test } from 'qunit';

module(
  'Unit | Utils | form-validations | RRN helpers | 06.02.02-001.11',
  function () {
    const rrn = '06020200111';
    const formattedRrn = '06.02.02-001.11';
    const parseResult = {
      birthDate: ['06', '02', '02'],
      checksum: '11',
      serial: '001',
    };
    test(`${formattedRrn} is a valid RRN`, function (assert) {
      assert.true(isValidRijksregisternummer(rrn));
    });
    test(`${formattedRrn} is parsed correctly`, function (assert) {
      assert.deepEqual(parse(rrn), parseResult);
    });
    test(`${formattedRrn} should return birthday YEAR 2006`, function (assert) {
      assert.deepEqual(getBirthYear(rrn), 2006);
    });
    test(`${formattedRrn} should return birthday MONTH 02`, function (assert) {
      assert.deepEqual(getBirthMonth(parseResult.birthDate), '02');
    });
    test(`${formattedRrn} should return birthday DAY 02`, function (assert) {
      assert.deepEqual(parseResult.birthDate[2], '02');
      assert.deepEqual(getBirthDay(parseResult.birthDate), '02');
    });
    test(`${formattedRrn} should return date 2006-02-02`, function (assert) {
      assert.deepEqual(getBirthDate(rrn), '2006-02-02');
    });
  }
);

module(
  'Unit | Utils | form-validations | RRN helpers | 06.02.02-000.80',
  function () {
    const rrn = '06020200080';
    const formattedRrn = '06.02.02-000.80';
    test(`${formattedRrn} is an invalid RRN, serial should be between 001 and 998`, function (assert) {
      assert.false(isValidRijksregisternummer(rrn));
    });
  }
);
