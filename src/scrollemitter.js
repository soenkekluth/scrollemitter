// require('setimmediate');
import Emitter from 'micromitter';
// import asap from 'asap';
import raf from 'raf';
import {direction} from './scroll-direction';
import scrollParent from './scroll-parent';

class ScrollEmitter extends Emitter {

  static direction = direction

  static defaultProps = {
    el: null,
    maxSpeed: false,
    speed: true,
    direction: true,
  }

  state = {

    position: {
      y: 0,
      x: 0,
    },

    speed: {
      y: 0,
      x: 0,
      xMax: 0,
      yMax: 0,
    },

    direction: {
      y: direction.none,
      x: direction.none,
    },
    scrolling: false,
    canScroll: {
      x: false,
      y: false,
    },
  };

  lastState = {
    position: {
      y: 0,
      x: 0,
    },

    speed: {
      y: 0,
      x: 0,
      xMax: 0,
      yMax: 0,
    },

    direction: {
      y: direction.none,
      x: direction.none,
    },
  };

  stopFrames = 0;
  firstRender = true;

  static getInstance(el) {
    if (this.hasInstance(el)) {
      return el.scrollEmitter;
    }
    return null;
  }

  static hasInstance(el) {
    return (el && (typeof el.scrollEmitter !== 'undefined' && el.scrollEmitter !== null));
  }

  static getScrollParent(element) {
    return scrollParent(element);
  }

  static get windowY() {
    return window.pageYOffset || window.scrollY || 0;
  }

  static get windowX() {
    return window.pageXOffset || window.scrollX || 0;
  }

  static get documentHeight() {
    return Math.max(
      document.body.scrollHeight,
      document.body.offsetHeight,
      document.documentElement.clientHeight,
      document.documentElement.scrollHeight,
      document.documentElement.offsetHeight
    );
  }

  static get documentWidth() {
    return Math.max(
      document.body.scrollWidth,
      document.body.offsetWidth,
      document.documentElement.clientWidth,
      document.documentElement.scrollWidth,
      document.documentElement.offsetWidth
    );
  }

  static events = {
    SCROLL_PROGRESS: 'scroll:progress',
    SCROLL_START: 'scroll:start',
    SCROLL_STOP: 'scroll:stop',
    SCROLL_DOWN: 'scroll:down',
    SCROLL_UP: 'scroll:up',
    SCROLL_MIN: 'scroll:min',
    SCROLL_MAX: 'scroll:max',
    SCROLL_RESIZE: 'scroll:resize',
  };

  constructor(props = {el:window}) {
    console.log('props', props);
    if (ScrollEmitter.hasInstance(props.el)) {
      return ScrollEmitter.getInstance(props.el);
    }

    super(props.el || window);

    this.props = Object.assign({}, ScrollEmitter.defaultProps, {el:window}, props);
    this.props.el.scrollEmitter = this;
    this.onScroll = this.onScroll.bind(this);
    this.onNextFrame = this.onNextFrame.bind(this);

    this.onResize = () => {
      this.emit(ScrollEmitter.events.SCROLL_RESIZE, { emitter: this });
    };

    if (this.props.el !== window) {
      this.getPosition = () => ({
        y: this.props.el.scrollTop,
        x: this.props.el.scrollLeft,
      });
      const regex = /(auto|scroll)/;
      const style = window.getComputedStyle(this.props.el, null);
      this.state.canScroll.y = regex.test(style.getPropertyValue('overflow-y'));
      this.state.canScroll.x = regex.test(style.getPropertyValue('overflow-x'));
    } else {
      this.getPosition = () => ({ y: ScrollEmitter.windowY, x: ScrollEmitter.windowX });
      this.state.canScroll.y = this.clientHeight < this.scrollHeight;
      this.state.canScroll.x = this.clientWidth < this.scrollWidth;
    }

    this.props.el.addEventListener('scroll', this.onScroll, false);
    this.props.el.addEventListener('resize', this.onResize, false);

    this.updatePosition();
  }

  destroy() {
    this.cancelNextFrame();

    if (this.props.el) {
      this.props.el.removeEventListener('scroll', this.onScroll);
      this.props.el.removeEventListener('resize', this.onResize);
      delete this.props.el.scrollEmitter;
    }
    this.props.el = null;
  }

  updatePosition() {
    this.lastState.position.y = this.state.position.y;
    this.lastState.position.x = this.state.position.x;
    this.state.position.y = this.y;
    this.state.position.x = this.x;
  }

  get x() {
    return this.getPosition().x;
  }
  get y() {
    return this.getPosition().y;
  }

  get direction() {
    return this.state.direction;
  }

  get speed() {
    return this.state.speed;
  }

  get el() {
    return this.props.el;
  }

  get scrolling() {
    return this.state.scrolling;
  }

  get clientHeight() {
    return this.props.el === window
      ? window.innerHeight
      : this.props.el.clientHeight;
  }

  get clientWidth() {
    return this.props.el === window
      ? window.innerWidth
      : this.props.el.clientWidth;
  }

  get scrollHeight() {
    return this.props.el === window
      ? ScrollEmitter.documentHeight
      : this.props.el.scrollHeight;
  }

  get scrollWidth() {
    return this.props.el === window
      ? ScrollEmitter.documentWidth
      : this.props.el.scrollWidth;
  }

  onScroll() {

    if (this.firstRender) {
      this.firstRender = false;
      if (this.y > 1 || this.x > 1) {
        this.updatePosition();
        this.emit(ScrollEmitter.events.SCROLL_PROGRESS, { emitter: this });
        return;
      }
    }

    this.stopFrames = 0;
    this.updatePosition();
    this.updateSpeed();

    if (!this.state.scrolling) {

      this.updateDirection();
      // this.props.el.removeEventListener('scroll', this.onScroll);
      this.state.scrolling = true;
      this.emit(ScrollEmitter.events.SCROLL_START, { emitter: this });
      this.frame = raf(this.onNextFrame);
      // asap(this.onNextFrame);

    }
    // this.immediateID = setImmediate(this.onNextFrame);
    // asap(this.onNextFrame);
  }

  updateSpeed() {
    if (this.props.speed) {
      this.lastState.speed.y = this.state.speed.y;
      this.lastState.speed.x = this.state.speed.x;
      this.state.speed.y = this.lastState.position.y - this.state.position.y;
      this.state.speed.x = this.lastState.position.x - this.state.position.x;
    }

    if (this.props.speed && this.props.maxSpeed) {
      if (this.state.speed.y < 0) {
        this.state.speed.yMax =
        this.state.speed.y < this.state.speed.yMax
          ? this.state.speed.y
          : this.state.speed.yMax;
      } else if (this.state.speed.y > 0) {
        this.state.speed.yMax =
        this.state.speed.y > this.state.speed.yMax
          ? this.state.speed.y
          : this.state.speed.yMax;
      }
    }
  }

  emitDirection() {

    if (this.state.canScroll.y && (this.lastState.direction.y !== this.state.direction.y)) {
      this.updateDirection();
      this.lastState.direction.y = this.state.direction.y;
      this.emit(
        'scroll:' +
        (this.state.direction.y === direction.down
          ? 'down'
          : 'up'),
        { emitter: this }
      );
    }
    if (this.state.canScroll.x && (this.lastState.direction.x !== this.state.direction.x)) {
      this.updateDirection();
      this.lastState.direction.x = this.state.direction.x;
      this.emit(
        'scroll:' +
          (this.state.direction.x === direction.right
            ? 'right'
            : 'left'),
        { emitter: this }
      );
    }

  }


  updateDirection() {

    if (this.state.canScroll.y) {
      if (this.state.speed.y === 0 && !this.state.scrolling) {
        this.state.direction.y = direction.none;
      } else {
        if (this.state.speed.y > 0) {
          this.state.direction.y = direction.up;
        } else if (this.state.speed.y < 0) {
          this.state.direction.y = direction.down;
        }
      }
    }

    if (this.state.canScroll.x ) {
      if (this.state.speed.x === 0 && !this.state.scrolling) {
        this.state.direction.x = direction.none;
      } else {
        if (this.state.speed.x > 0) {
          this.state.direction.x = direction.left;
        } else if (this.state.speed.x < 0) {
          this.state.direction.x = direction.right;
        }
      }
    }
  }

  onNextFrame() {
    if (!this.state.scrolling) {
      return;
    }

    this.emit(ScrollEmitter.events.SCROLL_PROGRESS, { emitter: this });

    const speed = ((this.state.position.y - this.lastState.position.y) + (this.state.position.x - this.lastState.position.x));
    if (!speed && this.stopFrames++ > 3) {
      this.onScrollStop();
      return;
    }

    if (this.props.direction) {
      this.emitDirection();
    }

    this.lastState.position.y = this.state.position.y;
    this.lastState.position.x = this.state.position.x;

    this.frame = raf(this.onNextFrame);
    // asap(this.onNextFrame);
    // this.immediateID = setImmediate(this.onNextFrame);
  }

  onScrollStop() {
    this.state.scrolling = false;

    this.cancelNextFrame();

    this.lastState.direction.y = this.state.direction.y;
    this.lastState.direction.x = this.state.direction.x;

    this.updatePosition();

    this.lastState.speed.x = this.state.speed.x = 0;
    this.lastState.speed.y = this.state.speed.y = 0;

    if (this.state.canScroll.y) {
      if (this.y <= 0) {
        this.emit(ScrollEmitter.events.SCROLL_MIN, { emitter: this });
      } else if (this.y + this.clientHeight >= this.scrollHeight) {
        this.emit(ScrollEmitter.events.SCROLL_MAX, { emitter: this });
      }
    }

    if (this.state.canScroll.x) {
      if (this.x <= 0) {
        this.emit(ScrollEmitter.events.SCROLL_MIN, { emitter: this });
      } else if (this.x + this.clientWidth >= this.scrollWidth) {
        this.emit(ScrollEmitter.events.SCROLL_MAX, { emitter: this });
      }
    }

    this.emit(ScrollEmitter.events.SCROLL_STOP, { emitter: this });

    this.state.direction.y = direction.none;
    this.state.direction.x = direction.none;

    this.state.speed.yMax = 0;
    this.state.speed.xMax = 0;

    // this.props.el.addEventListener('scroll', this.onScroll, false);
  }

  cancelNextFrame() {
    // console.log('this.asap', this.asap);
    // console.log('this.immediateID', this.immediateID);
    // clearImmediate(this.immediateID);
    // this.cancelFrame = true;
    if (this.frame) {
      raf.cancel(this.frame);
      this.frame = null;
    }
    this.stopFrames = 0;
  }
}

export default ScrollEmitter;
