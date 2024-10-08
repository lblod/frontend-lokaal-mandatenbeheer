import { helper } from '@ember/component/helper';

export default helper(function isInPast([date]) {
  return date && new Date(date).getTime() < new Date().getTime();
});
