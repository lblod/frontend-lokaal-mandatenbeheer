import moment from 'moment';

export async function endOfDay(date) {
  if (date) {
    return moment(date).utc().add(1, 'days').startOf('day').toDate();
  } else {
    return moment().utc().add(1, 'days').startOf('day').toDate();
  }
}
