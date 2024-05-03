export default function contains(array, elem) {
  if (!array) {
    return false;
  }
  return array.some((element) => {
    return element.id == elem.id;
  });
}
