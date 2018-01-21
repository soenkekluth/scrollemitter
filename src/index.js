import ScrollEmitter from './scrollemitter';

if (typeof window !== 'undefined') {
  window.ScrollEmitter = ScrollEmitter;
}

export {default as scrollParent} from './scroll-parent';
export {direction as direction} from './scroll-direction';
export {default as directionToString} from './scroll-direction';
export {default as hasOverflow} from './has-overflow';
export default ScrollEmitter;
