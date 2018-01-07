const regex = /(auto|scroll)/;

const hasOverflow = element => {
  const style = window.getComputedStyle(element, null);
  return regex.test(style.getPropertyValue('overflow') + style.getPropertyValue('overflow-y') + style.getPropertyValue('overflow-x'));
};
module.exports = hasOverflow;
