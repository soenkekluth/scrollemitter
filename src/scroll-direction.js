export const direction = {
  up: -1,
  down: 1,
  none: 0,
  right: 2,
  left: -2,
};


export default function directionToString(value) {
  switch (value) {
    case direction.up:
      return 'up';
    case direction.none:
      return 'none';
    case direction.down:
      return 'down';
    case direction.left:
      return 'left';
    case direction.right:
      return 'right';
  }
  return 'none';
}
