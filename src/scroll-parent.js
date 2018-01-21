const hasOverflow = require('./has-overflow');

const scrollParent = element => {

  if (!(element instanceof HTMLElement)) {
    return window;
  }

  while (element.parentNode) {
    if (element.parentNode === document.body) {
      return window;
    }

    if (hasOverflow(element.parentNode)) {
      return element.parentNode;
    }
    element = element.parentNode;
  }
  return window;
};

export default scrollParent;
