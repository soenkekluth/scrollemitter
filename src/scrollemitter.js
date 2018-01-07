import Emitter from 'micromitter';
import raf from 'raf';
import scrollParent from './scroll-parent';

class ScrollEmitter extends Emitter {
  _scrollTarget = null;
  _y = 0;
  _x = 0;
  _speedY = 0;
  _maxSpeedY = 0;
  _speedX = 0;
  _lastSpeed = 0;
  _lastDirectionY = ScrollEmitter.direction.none;
  _lastDirectionX = ScrollEmitter.direction.none;
  _stopFrames = 3;
  _currentStopFrames = 0;
  _firstRender = true;
  _directionY = ScrollEmitter.direction.none;
  _directionX = ScrollEmitter.direction.none;
  _scrolling = false;
  _canScrollY = false;
  _canScrollX = false;

  static getInstance(scrollTarget, options) {
    if (!scrollTarget.scrollEmitter) {
      return new ScrollEmitter(scrollTarget, options);
    }
    return scrollTarget.scrollEmitter;
  }

  static hasInstance(scrollTarget) {
    return typeof scrollTarget.scrollEmitter !== 'undefined';
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

  static direction = {
    up: -1,
    down: 1,
    none: 0,
    right: 2,
    left: -2,
  };

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

  constructor(scrollTarget = window, options = {}) {
    if (ScrollEmitter.hasInstance(scrollTarget)) {
      return ScrollEmitter.getInstance(scrollTarget);
    }

    super(scrollTarget);

    scrollTarget.scrollEmitter = this;
    this._scrollTarget = scrollTarget;
    this.cancelFrame = false;
    this.options = options;

    this.init();
  }

  init() {
    this.getScrollPosition =
      this._scrollTarget === window
        ? function() {
            return { y: ScrollEmitter.windowY, x: ScrollEmitter.windowX };
          }.bind(this)
        : function() {
            return {
              y: this._scrollTarget.scrollTop,
              x: this._scrollTarget.scrollLeft,
            };
          }.bind(this);

    this.onResize = () => {
      this.emit(ScrollEmitter.events.SCROLL_RESIZE,{emitter:this});
    };
    this.onScroll = this.onScroll.bind(this);
    this.onNextFrame = this.onNextFrame.bind(this);

    this.updateScrollPosition();

    if (this._scrollTarget !== window) {
      const regex = /(auto|scroll)/;
      const style = window.getComputedStyle(this._scrollTarget, null);
      this._canScrollY = regex.test(style.getPropertyValue('overflow-y'));
      this._canScrollX = regex.test(style.getPropertyValue('overflow-x'));
    } else {
      this._canScrollY = this.clientHeight < this.scrollHeight;
      this._canScrollX = this.clientWidth < this.scrollWidth;
    }

    if (this._scrollTarget.addEventListener) {
      this._scrollTarget.addEventListener('scroll', this.onScroll, false);
      this._scrollTarget.addEventListener('resize', this.onResize, false);
    } else if (this._scrollTarget.attachEvent) {
      this._scrollTarget.attachEvent('scroll', this.onScroll);
      this._scrollTarget.attachEvent('resize', this.onResize);
    }
  }

  destroy() {
    this._cancelNextFrame();

    if (this._scrollTarget) {
      if (this._scrollTarget.addEventListener) {
        this._scrollTarget.removeEventListener('scroll', this.onScroll);
        this._scrollTarget.removeEventListener('resize', this.onResize);
      } else if (this._scrollTarget.attachEvent) {
        this._scrollTarget.detachEvent('scroll', this.onScroll);
        this._scrollTarget.detachEvent('resize', this.onResize);
      }
    }

    // this.onResize = null;
    // this.onScroll = null;
    // this.getScrollPosition = null;
    // this.onNextFrame = null;
    delete this._scrollTarget.scrollEmitter;
    this._scrollTarget = null;
  }

  updateScrollPosition() {
    this._y = this.y;
    this._x = this.x;
  }

  get scrollPosition() {
    return this.getScrollPosition();
  }

  get directionY() {
    if (!this._canScrollY || (this.speedY === 0 && !this._scrolling)) {
      this._directionY = ScrollEmitter.direction.none;
    } else {
      if (this.speedY > 0) {
        this._directionY = ScrollEmitter.direction.up;
      } else if (this.speedY < 0) {
        this._directionY = ScrollEmitter.direction.down;
      }
    }
    return this._directionY;
  }

  get directionX() {
    if (!this._canScrollX || (this.speedX === 0 && !this._scrolling)) {
      this._directionX = ScrollEmitter.direction.none;
    } else {
      if (this.speedX > 0) {
        this._directionX = ScrollEmitter.direction.left;
      } else if (this.speedX < 0) {
        this._directionX = ScrollEmitter.direction.right;
      }
    }
    return this._directionX;
  }

  get scrollTarget() {
    return this._scrollTarget;
  }

  get scrolling() {
    return this._scrolling;
  }

  get speedY() {
    return this._speedY;
  }

  get speedY() {
    return this._speedY;
  }

  get speedX() {
    return this._speedX;
  }

  get maxSpeedY() {
    return this._maxSpeedY;
  }

  get canScrollY() {
    return this._canScrollY;
  }

  get canScrollX() {
    return this._canScrollX;
  }

  get y() {
    return this.scrollPosition.y;
  }

  get x() {
    return this.scrollPosition.x;
  }

  get clientHeight() {
    return this._scrollTarget === window
      ? window.innerHeight
      : this._scrollTarget.clientHeight;
  }

  get clientWidth() {
    return this._scrollTarget === window
      ? window.innerWidth
      : this._scrollTarget.clientWidth;
  }

  get scrollHeight() {
    return this._scrollTarget === window
      ? ScrollEmitter.documentHeight
      : this._scrollTarget.scrollHeight;
  }

  get scrollWidth() {
    return this._scrollTarget === window
      ? ScrollEmitter.documentWidth
      : this._scrollTarget.scrollWidth;
  }

  onScroll() {
    this._currentStopFrames = 0;
    if (this._firstRender) {
      this._firstRender = false;
      if (this.y > 1 || this.x > 1) {
        this.updateScrollPosition();
        this.emit(ScrollEmitter.events.SCROLL_PROGRESS,{emitter:this});
        return;
      }
    }

    if (!this._scrolling) {
      this._scrolling = true;
      this._maxSpeedY = 0;
      this._lastDirectionY = ScrollEmitter.direction.none;
      this._lastDirectionX = ScrollEmitter.direction.none;
      this.emit(ScrollEmitter.events.SCROLL_START,{emitter:this});
      this.cancelFrame = false;
      raf(this.onNextFrame);
    }
  }

  onNextFrame() {
    if (!this.cancelFrame) {
      this._speedY = this._y - this.y;
      this._speedX = this._x - this.x;

      if (this._speedY < 0) {
        this._maxSpeedY =
          this._speedY < this._maxSpeedY ? this._speedY : this._maxSpeedY;
      } else if (this._speedY > 0) {
        this._maxSpeedY =
          this._speedY > this._maxSpeedY ? this._speedY : this._maxSpeedY;
      }

      var speed = +this.speedY + +this.speedX;
      if (
        this._scrolling &&
        (speed === 0 && this._currentStopFrames++ > this._stopFrames)
      ) {
        this.onScrollStop();
        return;
      }

      this.updateScrollPosition();

      if (this._lastDirectionY !== this.directionY) {
        this.emit(
          'scroll:' +
            (this.directionY === ScrollEmitter.direction.down
              ? 'down'
              : 'up'),
          { emitter: this }
        );
      }
      if (this._lastDirectionX !== this.directionX) {
        this.emit(
          'scroll:' +
            (this.directionX === ScrollEmitter.direction.right
              ? 'right'
              : 'left'),
          { emitter: this }
        );
      }

      this._lastDirectionY = this.directionY;
      this._lastDirectionX = this.directionX;

      this.emit(ScrollEmitter.events.SCROLL_PROGRESS,{emitter:this});

      raf(this.onNextFrame);
    }
  }

  onScrollStop() {
    this._cancelNextFrame();
    this._scrolling = false;

    if (this._scrollTarget) {
      this.updateScrollPosition();

      this.emit(ScrollEmitter.events.SCROLL_STOP,{emitter:this});

      if (this._canScrollY) {
        if (this.y <= 0) {
          this.emit(ScrollEmitter.events.SCROLL_MIN,{emitter:this});
        } else if (this.y + this.clientHeight >= this.scrollHeight) {
          this.emit(ScrollEmitter.events.SCROLL_MAX,{emitter:this});
        }
      }

      if (this._canScrollX) {
        if (this.x <= 0) {
          this.emit(ScrollEmitter.events.SCROLL_MIN,{emitter:this});
        } else if (this.x + this.clientWidth >= this.scrollWidth) {
          this.emit(ScrollEmitter.events.SCROLL_MAX,{emitter:this});
        }
      }
    } else {
      this.emit(ScrollEmitter.events.SCROLL_STOP,{emitter:this});
    }
  }

  _cancelNextFrame() {
    this.cancelFrame = true;
    this._currentStopFrames = 0;
  }
}

export default ScrollEmitter;
