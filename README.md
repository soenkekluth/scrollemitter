# ScrollEmitter

enhanced scroll events like scroll: start, progress, stop, min, max

ScrollEmitter gives you custom scroll events like

```js
scroll:start
scroll:progress
scroll:up
scroll:down
scroll:left
scroll:right
scroll:stop
scroll:min
scroll:max
```

for better event / action handling
the events are triggered only in animation frames for the most performant way of default DOM manipulation.

further more it adds special propertys to the scroll state :

```js
scrolling.y
scrolling.x
scrolling.speed {x,y, xMax, yMax}
scrolling.direction {x,y}
```

ScrollEmitter will only be instanciated once for the same scroll target to save memory and optimize the performance.

### Dependencies

[micromitter!
](https://github.com/soenkekluth/micromitter)

[raf](https://github.com/chrisdickinson/raf)

### Browser support

IE >= 9, \*

### install

```
npm i --save scrollemitter
yarn add scrollemitter
```


### Usage

```js
var ScrollEmitter = require('ScrollEmitter');

// takes window as scroll target
var scrolling = new ScrollEmitter(); 

// or
var elementScrolling = new ScrollEmitter({el: document.querySelector('yourElement')});

scrolling
.on('scroll:down', function(event) {
  console.log('========== scroll:down =============');
})
.on('scroll:up', function(event) {
  console.log('========== scroll:up =============');
})
.on('scroll:max', function(event) {
  console.log('========== scroll:max =============');
})
.on('scroll:min', function(event) {
  console.log('========== scroll:min =============');
})
.on('scroll:start', function(event) {
  console.log('========== scroll:start =============');
})
.on('scroll:progress', function(event) {
  console.log(
    'scroll:progress  y:' +
      scrolling.y +
      '  direction: ' +
      scrolling.direction.y
  );
})
.on('scroll:stop', function(event) {
  console.log('========== scroll:stop =============');

});
```

### demo (will be updated soon)

https://rawgit.com/soenkekluth/scrollemitter/master/demo/index.html
please see the console.logs for now
