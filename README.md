# ScrollEmitter

[![Greenkeeper badge](https://badges.greenkeeper.io/soenkekluth/scrollemitter.svg)](https://greenkeeper.io/)
enhanced scroll events like scroll: start, progress, stop, min, max

ScrollEmitter gives you custom scroll events like 
```
scroll:start
scroll:progress and 
scroll:end 
scroll:min 
scroll:max 
```
for better event / action handling
the events are triggered only in animation frames for the most performant way of default DOM manipulation.

further more it adds special propertys to the scroll state :
```
y
x
speedY
speedX
directionY
directionX
```

ScrollEmitter will only be instanciated once for the same scroll target to save memory and optimize the performance.


### Dependencies
none!

### Browser support
IE >= 9, *

### install
```
npm install scrollemitter
```
### demo (will be updated soon)
https://rawgit.com/soenkekluth/scrollemitter/master/demo/index.html
please see the console.logs for now

### js
```javascript
var ScrollEmitter = require('ScrollEmitter');
var scrollemitter = new ScrollEmitter(); // takes window as scroll target
// or
new ScrollEmitter(document.querySelector('yourElement'))


scrollemitter.on('scroll:down', function(event) {
  console.log('========== scroll:down =============');
});

scrollemitter.on('scroll:up', function(event) {
  console.log('========== scroll:up =============');
});

scrollemitter.on('scroll:max', function(event) {
  console.log('========== scroll:max =============');
});

scrollemitter.on('scroll:min', function(event) {
  console.log('========== scroll:min =============');
});

scrollemitter.on('scroll:start', function(event) {
  console.log('scroll:start     y:' + scrollemitter.y + '  direction: ' + scrollemitter.directionY+' ('+ scrollemitter.directionToString(scrollemitter.directionY)+')')
});

scrollemitter.on('scroll:progress', function(event) {
  console.log('scroll:progress  y:' + scrollemitter.y + '  direction: ' + scrollemitter.directionY+' ('+ scrollemitter.directionToString(scrollemitter.directionY)+')')
});

scrollemitter.on('scroll:stop', function(event) {
  console.log('scroll:stop      y:' + scrollemitter.y + '  direction: ' + scrollemitter.directionY+' ('+ scrollemitter.directionToString(scrollemitter.directionY)+')')
});

```
