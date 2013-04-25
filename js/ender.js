/*!
  * =============================================================
  * Ender: open module JavaScript framework (https://ender.no.de)
  * Build: ender build iscroll domready qwery bonzo bean --output js/ender.js
  * Packages: ender-js@0.4.4-1 iscroll@4.2.5 domready@0.2.11 qwery@3.4.1 bonzo@1.3.5 bean@1.0.3
  * =============================================================
  */

/*!
  * Ender: open module JavaScript framework (client-lib)
  * copyright Dustin Diaz & Jacob Thornton 2011-2012 (@ded @fat)
  * http://ender.jit.su
  * License MIT
  */
(function (context) {

  // a global object for node.js module compatiblity
  // ============================================

  context['global'] = context

  // Implements simple module system
  // losely based on CommonJS Modules spec v1.1.1
  // ============================================

  var modules = {}
    , old = context['$']
    , oldEnder = context['ender']
    , oldRequire = context['require']
    , oldProvide = context['provide']

  function require (identifier) {
    // modules can be required from ender's build system, or found on the window
    var module = modules['$' + identifier] || window[identifier]
    if (!module) throw new Error("Ender Error: Requested module '" + identifier + "' has not been defined.")
    return module
  }

  function provide (name, what) {
    return (modules['$' + name] = what)
  }

  context['provide'] = provide
  context['require'] = require

  function aug(o, o2) {
    for (var k in o2) k != 'noConflict' && k != '_VERSION' && (o[k] = o2[k])
    return o
  }

  /**
   * main Ender return object
   * @constructor
   * @param {Array|Node|string} s a CSS selector or DOM node(s)
   * @param {Array.|Node} r a root node(s)
   */
  function Ender(s, r) {
    var elements
      , i

    this.selector = s
    // string || node || nodelist || window
    if (typeof s == 'undefined') {
      elements = []
      this.selector = ''
    } else if (typeof s == 'string' || s.nodeName || (s.length && 'item' in s) || s == window) {
      elements = ender._select(s, r)
    } else {
      elements = isFinite(s.length) ? s : [s]
    }
    this.length = elements.length
    for (i = this.length; i--;) this[i] = elements[i]
  }

  /**
   * @param {function(el, i, inst)} fn
   * @param {Object} opt_scope
   * @returns {Ender}
   */
  Ender.prototype['forEach'] = function (fn, opt_scope) {
    var i, l
    // opt out of native forEach so we can intentionally call our own scope
    // defaulting to the current item and be able to return self
    for (i = 0, l = this.length; i < l; ++i) i in this && fn.call(opt_scope || this[i], this[i], i, this)
    // return self for chaining
    return this
  }

  Ender.prototype.$ = ender // handy reference to self


  function ender(s, r) {
    return new Ender(s, r)
  }

  ender['_VERSION'] = '0.4.3-dev'

  ender.fn = Ender.prototype // for easy compat to jQuery plugins

  ender.ender = function (o, chain) {
    aug(chain ? Ender.prototype : ender, o)
  }

  ender._select = function (s, r) {
    if (typeof s == 'string') return (r || document).querySelectorAll(s)
    if (s.nodeName) return [s]
    return s
  }


  // use callback to receive Ender's require & provide and remove them from global
  ender.noConflict = function (callback) {
    context['$'] = old
    if (callback) {
      context['provide'] = oldProvide
      context['require'] = oldRequire
      context['ender'] = oldEnder
      if (typeof callback == 'function') callback(require, provide, this)
    }
    return this
  }

  if (typeof module !== 'undefined' && module.exports) module.exports = ender
  // use subscript notation as extern for Closure compilation
  context['ender'] = context['$'] = ender

}(this));

(function () {

  var module = { exports: {} }, exports = module.exports;

  /*!
   * iScroll v4.2.5 ~ Copyright (c) 2012 Matteo Spinelli, http://cubiq.org
   * Released under MIT license, http://cubiq.org/license
   */
  (function(window, doc){
  var m = Math,
  	dummyStyle = doc.createElement('div').style,
  	vendor = (function () {
  		var vendors = 't,webkitT,MozT,msT,OT'.split(','),
  			t,
  			i = 0,
  			l = vendors.length;

  		for ( ; i < l; i++ ) {
  			t = vendors[i] + 'ransform';
  			if ( t in dummyStyle ) {
  				return vendors[i].substr(0, vendors[i].length - 1);
  			}
  		}

  		return false;
  	})(),
  	cssVendor = vendor ? '-' + vendor.toLowerCase() + '-' : '',

  	// Style properties
  	transform = prefixStyle('transform'),
  	transitionProperty = prefixStyle('transitionProperty'),
  	transitionDuration = prefixStyle('transitionDuration'),
  	transformOrigin = prefixStyle('transformOrigin'),
  	transitionTimingFunction = prefixStyle('transitionTimingFunction'),
  	transitionDelay = prefixStyle('transitionDelay'),

      // Browser capabilities
  	isAndroid = (/android/gi).test(navigator.appVersion),
  	isIDevice = (/iphone|ipad/gi).test(navigator.appVersion),
  	isTouchPad = (/hp-tablet/gi).test(navigator.appVersion),

      has3d = prefixStyle('perspective') in dummyStyle,
      hasTouch = 'ontouchstart' in window && !isTouchPad,
      hasTransform = vendor !== false,
      hasTransitionEnd = prefixStyle('transition') in dummyStyle,

  	RESIZE_EV = 'onorientationchange' in window ? 'orientationchange' : 'resize',
  	START_EV = hasTouch ? 'touchstart' : 'mousedown',
  	MOVE_EV = hasTouch ? 'touchmove' : 'mousemove',
  	END_EV = hasTouch ? 'touchend' : 'mouseup',
  	CANCEL_EV = hasTouch ? 'touchcancel' : 'mouseup',
  	TRNEND_EV = (function () {
  		if ( vendor === false ) return false;

  		var transitionEnd = {
  				''			: 'transitionend',
  				'webkit'	: 'webkitTransitionEnd',
  				'Moz'		: 'transitionend',
  				'O'			: 'otransitionend',
  				'ms'		: 'MSTransitionEnd'
  			};

  		return transitionEnd[vendor];
  	})(),

  	nextFrame = (function() {
  		return window.requestAnimationFrame ||
  			window.webkitRequestAnimationFrame ||
  			window.mozRequestAnimationFrame ||
  			window.oRequestAnimationFrame ||
  			window.msRequestAnimationFrame ||
  			function(callback) { return setTimeout(callback, 1); };
  	})(),
  	cancelFrame = (function () {
  		return window.cancelRequestAnimationFrame ||
  			window.webkitCancelAnimationFrame ||
  			window.webkitCancelRequestAnimationFrame ||
  			window.mozCancelRequestAnimationFrame ||
  			window.oCancelRequestAnimationFrame ||
  			window.msCancelRequestAnimationFrame ||
  			clearTimeout;
  	})(),

  	// Helpers
  	translateZ = has3d ? ' translateZ(0)' : '',

  	// Constructor
  	iScroll = function (el, options) {
  		var that = this,
  			i;

  		that.wrapper = typeof el == 'object' ? el : doc.getElementById(el);
  		that.wrapper.style.overflow = 'hidden';
  		that.scroller = that.wrapper.children[0];

  		// Default options
  		that.options = {
  			hScroll: true,
  			vScroll: true,
  			x: 0,
  			y: 0,
  			bounce: true,
  			bounceLock: false,
  			momentum: true,
  			lockDirection: true,
  			useTransform: true,
  			useTransition: false,
  			topOffset: 0,
  			checkDOMChanges: false,		// Experimental
  			handleClick: true,

  			// Scrollbar
  			hScrollbar: true,
  			vScrollbar: true,
  			fixedScrollbar: isAndroid,
  			hideScrollbar: isIDevice,
  			fadeScrollbar: isIDevice && has3d,
  			scrollbarClass: '',

  			// Zoom
  			zoom: false,
  			zoomMin: 1,
  			zoomMax: 4,
  			doubleTapZoom: 2,
  			wheelAction: 'scroll',

  			// Snap
  			snap: false,
  			snapThreshold: 1,

  			// Events
  			onRefresh: null,
  			onBeforeScrollStart: function (e) { e.preventDefault(); },
  			onScrollStart: null,
  			onBeforeScrollMove: null,
  			onScrollMove: null,
  			onBeforeScrollEnd: null,
  			onScrollEnd: null,
  			onTouchEnd: null,
  			onDestroy: null,
  			onZoomStart: null,
  			onZoom: null,
  			onZoomEnd: null
  		};

  		// User defined options
  		for (i in options) that.options[i] = options[i];
		
  		// Set starting position
  		that.x = that.options.x;
  		that.y = that.options.y;

  		// Normalize options
  		that.options.useTransform = hasTransform && that.options.useTransform;
  		that.options.hScrollbar = that.options.hScroll && that.options.hScrollbar;
  		that.options.vScrollbar = that.options.vScroll && that.options.vScrollbar;
  		that.options.zoom = that.options.useTransform && that.options.zoom;
  		that.options.useTransition = hasTransitionEnd && that.options.useTransition;

  		// Helpers FIX ANDROID BUG!
  		// translate3d and scale doesn't work together!
  		// Ignoring 3d ONLY WHEN YOU SET that.options.zoom
  		if ( that.options.zoom && isAndroid ){
  			translateZ = '';
  		}
		
  		// Set some default styles
  		that.scroller.style[transitionProperty] = that.options.useTransform ? cssVendor + 'transform' : 'top left';
  		that.scroller.style[transitionDuration] = '0';
  		that.scroller.style[transformOrigin] = '0 0';
  		if (that.options.useTransition) that.scroller.style[transitionTimingFunction] = 'cubic-bezier(0.33,0.66,0.66,1)';
		
  		if (that.options.useTransform) that.scroller.style[transform] = 'translate(' + that.x + 'px,' + that.y + 'px)' + translateZ;
  		else that.scroller.style.cssText += ';position:absolute;top:' + that.y + 'px;left:' + that.x + 'px';

  		if (that.options.useTransition) that.options.fixedScrollbar = true;

  		that.refresh();

  		that._bind(RESIZE_EV, window);
  		that._bind(START_EV);
  		if (!hasTouch) {
  			if (that.options.wheelAction != 'none') {
  				that._bind('DOMMouseScroll');
  				that._bind('mousewheel');
  			}
  		}

  		if (that.options.checkDOMChanges) that.checkDOMTime = setInterval(function () {
  			that._checkDOMChanges();
  		}, 500);
  	};

  // Prototype
  iScroll.prototype = {
  	enabled: true,
  	x: 0,
  	y: 0,
  	steps: [],
  	scale: 1,
  	currPageX: 0, currPageY: 0,
  	pagesX: [], pagesY: [],
  	aniTime: null,
  	wheelZoomCount: 0,
	
  	handleEvent: function (e) {
  		var that = this;
  		switch(e.type) {
  			case START_EV:
  				if (!hasTouch && e.button !== 0) return;
  				that._start(e);
  				break;
  			case MOVE_EV: that._move(e); break;
  			case END_EV:
  			case CANCEL_EV: that._end(e); break;
  			case RESIZE_EV: that._resize(); break;
  			case 'DOMMouseScroll': case 'mousewheel': that._wheel(e); break;
  			case TRNEND_EV: that._transitionEnd(e); break;
  		}
  	},
	
  	_checkDOMChanges: function () {
  		if (this.moved || this.zoomed || this.animating ||
  			(this.scrollerW == this.scroller.offsetWidth * this.scale && this.scrollerH == this.scroller.offsetHeight * this.scale)) return;

  		this.refresh();
  	},
	
  	_scrollbar: function (dir) {
  		var that = this,
  			bar;

  		if (!that[dir + 'Scrollbar']) {
  			if (that[dir + 'ScrollbarWrapper']) {
  				if (hasTransform) that[dir + 'ScrollbarIndicator'].style[transform] = '';
  				that[dir + 'ScrollbarWrapper'].parentNode.removeChild(that[dir + 'ScrollbarWrapper']);
  				that[dir + 'ScrollbarWrapper'] = null;
  				that[dir + 'ScrollbarIndicator'] = null;
  			}

  			return;
  		}

  		if (!that[dir + 'ScrollbarWrapper']) {
  			// Create the scrollbar wrapper
  			bar = doc.createElement('div');

  			if (that.options.scrollbarClass) bar.className = that.options.scrollbarClass + dir.toUpperCase();
  			else bar.style.cssText = 'position:absolute;z-index:100;' + (dir == 'h' ? 'height:7px;bottom:1px;left:2px;right:' + (that.vScrollbar ? '7' : '2') + 'px' : 'width:7px;bottom:' + (that.hScrollbar ? '7' : '2') + 'px;top:2px;right:1px');

  			bar.style.cssText += ';pointer-events:none;' + cssVendor + 'transition-property:opacity;' + cssVendor + 'transition-duration:' + (that.options.fadeScrollbar ? '350ms' : '0') + ';overflow:hidden;opacity:' + (that.options.hideScrollbar ? '0' : '1');

  			that.wrapper.appendChild(bar);
  			that[dir + 'ScrollbarWrapper'] = bar;

  			// Create the scrollbar indicator
  			bar = doc.createElement('div');
  			if (!that.options.scrollbarClass) {
  				bar.style.cssText = 'position:absolute;z-index:100;background:rgba(0,0,0,0.5);border:1px solid rgba(255,255,255,0.9);' + cssVendor + 'background-clip:padding-box;' + cssVendor + 'box-sizing:border-box;' + (dir == 'h' ? 'height:100%' : 'width:100%') + ';' + cssVendor + 'border-radius:3px;border-radius:3px';
  			}
  			bar.style.cssText += ';pointer-events:none;' + cssVendor + 'transition-property:' + cssVendor + 'transform;' + cssVendor + 'transition-timing-function:cubic-bezier(0.33,0.66,0.66,1);' + cssVendor + 'transition-duration:0;' + cssVendor + 'transform: translate(0,0)' + translateZ;
  			if (that.options.useTransition) bar.style.cssText += ';' + cssVendor + 'transition-timing-function:cubic-bezier(0.33,0.66,0.66,1)';

  			that[dir + 'ScrollbarWrapper'].appendChild(bar);
  			that[dir + 'ScrollbarIndicator'] = bar;
  		}

  		if (dir == 'h') {
  			that.hScrollbarSize = that.hScrollbarWrapper.clientWidth;
  			that.hScrollbarIndicatorSize = m.max(m.round(that.hScrollbarSize * that.hScrollbarSize / that.scrollerW), 8);
  			that.hScrollbarIndicator.style.width = that.hScrollbarIndicatorSize + 'px';
  			that.hScrollbarMaxScroll = that.hScrollbarSize - that.hScrollbarIndicatorSize;
  			that.hScrollbarProp = that.hScrollbarMaxScroll / that.maxScrollX;
  		} else {
  			that.vScrollbarSize = that.vScrollbarWrapper.clientHeight;
  			that.vScrollbarIndicatorSize = m.max(m.round(that.vScrollbarSize * that.vScrollbarSize / that.scrollerH), 8);
  			that.vScrollbarIndicator.style.height = that.vScrollbarIndicatorSize + 'px';
  			that.vScrollbarMaxScroll = that.vScrollbarSize - that.vScrollbarIndicatorSize;
  			that.vScrollbarProp = that.vScrollbarMaxScroll / that.maxScrollY;
  		}

  		// Reset position
  		that._scrollbarPos(dir, true);
  	},
	
  	_resize: function () {
  		var that = this;
  		setTimeout(function () { that.refresh(); }, isAndroid ? 200 : 0);
  	},
	
  	_pos: function (x, y) {
  		if (this.zoomed) return;

  		x = this.hScroll ? x : 0;
  		y = this.vScroll ? y : 0;

  		if (this.options.useTransform) {
  			this.scroller.style[transform] = 'translate(' + x + 'px,' + y + 'px) scale(' + this.scale + ')' + translateZ;
  		} else {
  			x = m.round(x);
  			y = m.round(y);
  			this.scroller.style.left = x + 'px';
  			this.scroller.style.top = y + 'px';
  		}

  		this.x = x;
  		this.y = y;

  		this._scrollbarPos('h');
  		this._scrollbarPos('v');
  	},

  	_scrollbarPos: function (dir, hidden) {
  		var that = this,
  			pos = dir == 'h' ? that.x : that.y,
  			size;

  		if (!that[dir + 'Scrollbar']) return;

  		pos = that[dir + 'ScrollbarProp'] * pos;

  		if (pos < 0) {
  			if (!that.options.fixedScrollbar) {
  				size = that[dir + 'ScrollbarIndicatorSize'] + m.round(pos * 3);
  				if (size < 8) size = 8;
  				that[dir + 'ScrollbarIndicator'].style[dir == 'h' ? 'width' : 'height'] = size + 'px';
  			}
  			pos = 0;
  		} else if (pos > that[dir + 'ScrollbarMaxScroll']) {
  			if (!that.options.fixedScrollbar) {
  				size = that[dir + 'ScrollbarIndicatorSize'] - m.round((pos - that[dir + 'ScrollbarMaxScroll']) * 3);
  				if (size < 8) size = 8;
  				that[dir + 'ScrollbarIndicator'].style[dir == 'h' ? 'width' : 'height'] = size + 'px';
  				pos = that[dir + 'ScrollbarMaxScroll'] + (that[dir + 'ScrollbarIndicatorSize'] - size);
  			} else {
  				pos = that[dir + 'ScrollbarMaxScroll'];
  			}
  		}

  		that[dir + 'ScrollbarWrapper'].style[transitionDelay] = '0';
  		that[dir + 'ScrollbarWrapper'].style.opacity = hidden && that.options.hideScrollbar ? '0' : '1';
  		that[dir + 'ScrollbarIndicator'].style[transform] = 'translate(' + (dir == 'h' ? pos + 'px,0)' : '0,' + pos + 'px)') + translateZ;
  	},
	
  	_start: function (e) {
  		var that = this,
  			point = hasTouch ? e.touches[0] : e,
  			matrix, x, y,
  			c1, c2;

  		if (!that.enabled) return;

  		if (that.options.onBeforeScrollStart) that.options.onBeforeScrollStart.call(that, e);

  		if (that.options.useTransition || that.options.zoom) that._transitionTime(0);

  		that.moved = false;
  		that.animating = false;
  		that.zoomed = false;
  		that.distX = 0;
  		that.distY = 0;
  		that.absDistX = 0;
  		that.absDistY = 0;
  		that.dirX = 0;
  		that.dirY = 0;

  		// Gesture start
  		if (that.options.zoom && hasTouch && e.touches.length > 1) {
  			c1 = m.abs(e.touches[0].pageX-e.touches[1].pageX);
  			c2 = m.abs(e.touches[0].pageY-e.touches[1].pageY);
  			that.touchesDistStart = m.sqrt(c1 * c1 + c2 * c2);

  			that.originX = m.abs(e.touches[0].pageX + e.touches[1].pageX - that.wrapperOffsetLeft * 2) / 2 - that.x;
  			that.originY = m.abs(e.touches[0].pageY + e.touches[1].pageY - that.wrapperOffsetTop * 2) / 2 - that.y;

  			if (that.options.onZoomStart) that.options.onZoomStart.call(that, e);
  		}

  		if (that.options.momentum) {
  			if (that.options.useTransform) {
  				// Very lame general purpose alternative to CSSMatrix
  				matrix = getComputedStyle(that.scroller, null)[transform].replace(/[^0-9\-.,]/g, '').split(',');
  				x = +(matrix[12] || matrix[4]);
  				y = +(matrix[13] || matrix[5]);
  			} else {
  				x = +getComputedStyle(that.scroller, null).left.replace(/[^0-9-]/g, '');
  				y = +getComputedStyle(that.scroller, null).top.replace(/[^0-9-]/g, '');
  			}
			
  			if (x != that.x || y != that.y) {
  				if (that.options.useTransition) that._unbind(TRNEND_EV);
  				else cancelFrame(that.aniTime);
  				that.steps = [];
  				that._pos(x, y);
  				if (that.options.onScrollEnd) that.options.onScrollEnd.call(that);
  			}
  		}

  		that.absStartX = that.x;	// Needed by snap threshold
  		that.absStartY = that.y;

  		that.startX = that.x;
  		that.startY = that.y;
  		that.pointX = point.pageX;
  		that.pointY = point.pageY;

  		that.startTime = e.timeStamp || Date.now();

  		if (that.options.onScrollStart) that.options.onScrollStart.call(that, e);

  		that._bind(MOVE_EV, window);
  		that._bind(END_EV, window);
  		that._bind(CANCEL_EV, window);
  	},
	
  	_move: function (e) {
  		var that = this,
  			point = hasTouch ? e.touches[0] : e,
  			deltaX = point.pageX - that.pointX,
  			deltaY = point.pageY - that.pointY,
  			newX = that.x + deltaX,
  			newY = that.y + deltaY,
  			c1, c2, scale,
  			timestamp = e.timeStamp || Date.now();

  		if (that.options.onBeforeScrollMove) that.options.onBeforeScrollMove.call(that, e);

  		// Zoom
  		if (that.options.zoom && hasTouch && e.touches.length > 1) {
  			c1 = m.abs(e.touches[0].pageX - e.touches[1].pageX);
  			c2 = m.abs(e.touches[0].pageY - e.touches[1].pageY);
  			that.touchesDist = m.sqrt(c1*c1+c2*c2);

  			that.zoomed = true;

  			scale = 1 / that.touchesDistStart * that.touchesDist * this.scale;

  			if (scale < that.options.zoomMin) scale = 0.5 * that.options.zoomMin * Math.pow(2.0, scale / that.options.zoomMin);
  			else if (scale > that.options.zoomMax) scale = 2.0 * that.options.zoomMax * Math.pow(0.5, that.options.zoomMax / scale);

  			that.lastScale = scale / this.scale;

  			newX = this.originX - this.originX * that.lastScale + this.x,
  			newY = this.originY - this.originY * that.lastScale + this.y;

  			this.scroller.style[transform] = 'translate(' + newX + 'px,' + newY + 'px) scale(' + scale + ')' + translateZ;

  			if (that.options.onZoom) that.options.onZoom.call(that, e);
  			return;
  		}

  		that.pointX = point.pageX;
  		that.pointY = point.pageY;

  		// Slow down if outside of the boundaries
  		if (newX > 0 || newX < that.maxScrollX) {
  			newX = that.options.bounce ? that.x + (deltaX / 2) : newX >= 0 || that.maxScrollX >= 0 ? 0 : that.maxScrollX;
  		}
  		if (newY > that.minScrollY || newY < that.maxScrollY) {
  			newY = that.options.bounce ? that.y + (deltaY / 2) : newY >= that.minScrollY || that.maxScrollY >= 0 ? that.minScrollY : that.maxScrollY;
  		}

  		that.distX += deltaX;
  		that.distY += deltaY;
  		that.absDistX = m.abs(that.distX);
  		that.absDistY = m.abs(that.distY);

  		if (that.absDistX < 6 && that.absDistY < 6) {
  			return;
  		}

  		// Lock direction
  		if (that.options.lockDirection) {
  			if (that.absDistX > that.absDistY + 5) {
  				newY = that.y;
  				deltaY = 0;
  			} else if (that.absDistY > that.absDistX + 5) {
  				newX = that.x;
  				deltaX = 0;
  			}
  		}

  		that.moved = true;
  		that._pos(newX, newY);
  		that.dirX = deltaX > 0 ? -1 : deltaX < 0 ? 1 : 0;
  		that.dirY = deltaY > 0 ? -1 : deltaY < 0 ? 1 : 0;

  		if (timestamp - that.startTime > 300) {
  			that.startTime = timestamp;
  			that.startX = that.x;
  			that.startY = that.y;
  		}
		
  		if (that.options.onScrollMove) that.options.onScrollMove.call(that, e);
  	},
	
  	_end: function (e) {
  		if (hasTouch && e.touches.length !== 0) return;

  		var that = this,
  			point = hasTouch ? e.changedTouches[0] : e,
  			target, ev,
  			momentumX = { dist:0, time:0 },
  			momentumY = { dist:0, time:0 },
  			duration = (e.timeStamp || Date.now()) - that.startTime,
  			newPosX = that.x,
  			newPosY = that.y,
  			distX, distY,
  			newDuration,
  			snap,
  			scale;

  		that._unbind(MOVE_EV, window);
  		that._unbind(END_EV, window);
  		that._unbind(CANCEL_EV, window);

  		if (that.options.onBeforeScrollEnd) that.options.onBeforeScrollEnd.call(that, e);

  		if (that.zoomed) {
  			scale = that.scale * that.lastScale;
  			scale = Math.max(that.options.zoomMin, scale);
  			scale = Math.min(that.options.zoomMax, scale);
  			that.lastScale = scale / that.scale;
  			that.scale = scale;

  			that.x = that.originX - that.originX * that.lastScale + that.x;
  			that.y = that.originY - that.originY * that.lastScale + that.y;
			
  			that.scroller.style[transitionDuration] = '200ms';
  			that.scroller.style[transform] = 'translate(' + that.x + 'px,' + that.y + 'px) scale(' + that.scale + ')' + translateZ;
			
  			that.zoomed = false;
  			that.refresh();

  			if (that.options.onZoomEnd) that.options.onZoomEnd.call(that, e);
  			return;
  		}

  		if (!that.moved) {
  			if (hasTouch) {
  				if (that.doubleTapTimer && that.options.zoom) {
  					// Double tapped
  					clearTimeout(that.doubleTapTimer);
  					that.doubleTapTimer = null;
  					if (that.options.onZoomStart) that.options.onZoomStart.call(that, e);
  					that.zoom(that.pointX, that.pointY, that.scale == 1 ? that.options.doubleTapZoom : 1);
  					if (that.options.onZoomEnd) {
  						setTimeout(function() {
  							that.options.onZoomEnd.call(that, e);
  						}, 200); // 200 is default zoom duration
  					}
  				} else if (this.options.handleClick) {
  					that.doubleTapTimer = setTimeout(function () {
  						that.doubleTapTimer = null;

  						// Find the last touched element
  						target = point.target;
  						while (target.nodeType != 1) target = target.parentNode;

  						if (target.tagName != 'SELECT' && target.tagName != 'INPUT' && target.tagName != 'TEXTAREA') {
  							ev = doc.createEvent('MouseEvents');
  							ev.initMouseEvent('click', true, true, e.view, 1,
  								point.screenX, point.screenY, point.clientX, point.clientY,
  								e.ctrlKey, e.altKey, e.shiftKey, e.metaKey,
  								0, null);
  							ev._fake = true;
  							target.dispatchEvent(ev);
  						}
  					}, that.options.zoom ? 250 : 0);
  				}
  			}

  			that._resetPos(400);

  			if (that.options.onTouchEnd) that.options.onTouchEnd.call(that, e);
  			return;
  		}

  		if (duration < 300 && that.options.momentum) {
  			momentumX = newPosX ? that._momentum(newPosX - that.startX, duration, -that.x, that.scrollerW - that.wrapperW + that.x, that.options.bounce ? that.wrapperW : 0) : momentumX;
  			momentumY = newPosY ? that._momentum(newPosY - that.startY, duration, -that.y, (that.maxScrollY < 0 ? that.scrollerH - that.wrapperH + that.y - that.minScrollY : 0), that.options.bounce ? that.wrapperH : 0) : momentumY;

  			newPosX = that.x + momentumX.dist;
  			newPosY = that.y + momentumY.dist;

  			if ((that.x > 0 && newPosX > 0) || (that.x < that.maxScrollX && newPosX < that.maxScrollX)) momentumX = { dist:0, time:0 };
  			if ((that.y > that.minScrollY && newPosY > that.minScrollY) || (that.y < that.maxScrollY && newPosY < that.maxScrollY)) momentumY = { dist:0, time:0 };
  		}

  		if (momentumX.dist || momentumY.dist) {
  			newDuration = m.max(m.max(momentumX.time, momentumY.time), 10);

  			// Do we need to snap?
  			if (that.options.snap) {
  				distX = newPosX - that.absStartX;
  				distY = newPosY - that.absStartY;
  				if (m.abs(distX) < that.options.snapThreshold && m.abs(distY) < that.options.snapThreshold) { that.scrollTo(that.absStartX, that.absStartY, 200); }
  				else {
  					snap = that._snap(newPosX, newPosY);
  					newPosX = snap.x;
  					newPosY = snap.y;
  					newDuration = m.max(snap.time, newDuration);
  				}
  			}

  			that.scrollTo(m.round(newPosX), m.round(newPosY), newDuration);

  			if (that.options.onTouchEnd) that.options.onTouchEnd.call(that, e);
  			return;
  		}

  		// Do we need to snap?
  		if (that.options.snap) {
  			distX = newPosX - that.absStartX;
  			distY = newPosY - that.absStartY;
  			if (m.abs(distX) < that.options.snapThreshold && m.abs(distY) < that.options.snapThreshold) that.scrollTo(that.absStartX, that.absStartY, 200);
  			else {
  				snap = that._snap(that.x, that.y);
  				if (snap.x != that.x || snap.y != that.y) that.scrollTo(snap.x, snap.y, snap.time);
  			}

  			if (that.options.onTouchEnd) that.options.onTouchEnd.call(that, e);
  			return;
  		}

  		that._resetPos(200);
  		if (that.options.onTouchEnd) that.options.onTouchEnd.call(that, e);
  	},
	
  	_resetPos: function (time) {
  		var that = this,
  			resetX = that.x >= 0 ? 0 : that.x < that.maxScrollX ? that.maxScrollX : that.x,
  			resetY = that.y >= that.minScrollY || that.maxScrollY > 0 ? that.minScrollY : that.y < that.maxScrollY ? that.maxScrollY : that.y;

  		if (resetX == that.x && resetY == that.y) {
  			if (that.moved) {
  				that.moved = false;
  				if (that.options.onScrollEnd) that.options.onScrollEnd.call(that);		// Execute custom code on scroll end
  			}

  			if (that.hScrollbar && that.options.hideScrollbar) {
  				if (vendor == 'webkit') that.hScrollbarWrapper.style[transitionDelay] = '300ms';
  				that.hScrollbarWrapper.style.opacity = '0';
  			}
  			if (that.vScrollbar && that.options.hideScrollbar) {
  				if (vendor == 'webkit') that.vScrollbarWrapper.style[transitionDelay] = '300ms';
  				that.vScrollbarWrapper.style.opacity = '0';
  			}

  			return;
  		}

  		that.scrollTo(resetX, resetY, time || 0);
  	},

  	_wheel: function (e) {
  		var that = this,
  			wheelDeltaX, wheelDeltaY,
  			deltaX, deltaY,
  			deltaScale;

  		if ('wheelDeltaX' in e) {
  			wheelDeltaX = e.wheelDeltaX / 12;
  			wheelDeltaY = e.wheelDeltaY / 12;
  		} else if('wheelDelta' in e) {
  			wheelDeltaX = wheelDeltaY = e.wheelDelta / 12;
  		} else if ('detail' in e) {
  			wheelDeltaX = wheelDeltaY = -e.detail * 3;
  		} else {
  			return;
  		}
		
  		if (that.options.wheelAction == 'zoom') {
  			deltaScale = that.scale * Math.pow(2, 1/3 * (wheelDeltaY ? wheelDeltaY / Math.abs(wheelDeltaY) : 0));
  			if (deltaScale < that.options.zoomMin) deltaScale = that.options.zoomMin;
  			if (deltaScale > that.options.zoomMax) deltaScale = that.options.zoomMax;
			
  			if (deltaScale != that.scale) {
  				if (!that.wheelZoomCount && that.options.onZoomStart) that.options.onZoomStart.call(that, e);
  				that.wheelZoomCount++;
				
  				that.zoom(e.pageX, e.pageY, deltaScale, 400);
				
  				setTimeout(function() {
  					that.wheelZoomCount--;
  					if (!that.wheelZoomCount && that.options.onZoomEnd) that.options.onZoomEnd.call(that, e);
  				}, 400);
  			}
			
  			return;
  		}
		
  		deltaX = that.x + wheelDeltaX;
  		deltaY = that.y + wheelDeltaY;

  		if (deltaX > 0) deltaX = 0;
  		else if (deltaX < that.maxScrollX) deltaX = that.maxScrollX;

  		if (deltaY > that.minScrollY) deltaY = that.minScrollY;
  		else if (deltaY < that.maxScrollY) deltaY = that.maxScrollY;
    
  		if (that.maxScrollY < 0) {
  			that.scrollTo(deltaX, deltaY, 0);
  		}
  	},
	
  	_transitionEnd: function (e) {
  		var that = this;

  		if (e.target != that.scroller) return;

  		that._unbind(TRNEND_EV);
		
  		that._startAni();
  	},


  	/**
  	*
  	* Utilities
  	*
  	*/
  	_startAni: function () {
  		var that = this,
  			startX = that.x, startY = that.y,
  			startTime = Date.now(),
  			step, easeOut,
  			animate;

  		if (that.animating) return;
		
  		if (!that.steps.length) {
  			that._resetPos(400);
  			return;
  		}
		
  		step = that.steps.shift();
		
  		if (step.x == startX && step.y == startY) step.time = 0;

  		that.animating = true;
  		that.moved = true;
		
  		if (that.options.useTransition) {
  			that._transitionTime(step.time);
  			that._pos(step.x, step.y);
  			that.animating = false;
  			if (step.time) that._bind(TRNEND_EV);
  			else that._resetPos(0);
  			return;
  		}

  		animate = function () {
  			var now = Date.now(),
  				newX, newY;

  			if (now >= startTime + step.time) {
  				that._pos(step.x, step.y);
  				that.animating = false;
  				if (that.options.onAnimationEnd) that.options.onAnimationEnd.call(that);			// Execute custom code on animation end
  				that._startAni();
  				return;
  			}

  			now = (now - startTime) / step.time - 1;
  			easeOut = m.sqrt(1 - now * now);
  			newX = (step.x - startX) * easeOut + startX;
  			newY = (step.y - startY) * easeOut + startY;
  			that._pos(newX, newY);
  			if (that.animating) that.aniTime = nextFrame(animate);
  		};

  		animate();
  	},

  	_transitionTime: function (time) {
  		time += 'ms';
  		this.scroller.style[transitionDuration] = time;
  		if (this.hScrollbar) this.hScrollbarIndicator.style[transitionDuration] = time;
  		if (this.vScrollbar) this.vScrollbarIndicator.style[transitionDuration] = time;
  	},

  	_momentum: function (dist, time, maxDistUpper, maxDistLower, size) {
  		var deceleration = 0.0006,
  			speed = m.abs(dist) / time,
  			newDist = (speed * speed) / (2 * deceleration),
  			newTime = 0, outsideDist = 0;

  		// Proportinally reduce speed if we are outside of the boundaries
  		if (dist > 0 && newDist > maxDistUpper) {
  			outsideDist = size / (6 / (newDist / speed * deceleration));
  			maxDistUpper = maxDistUpper + outsideDist;
  			speed = speed * maxDistUpper / newDist;
  			newDist = maxDistUpper;
  		} else if (dist < 0 && newDist > maxDistLower) {
  			outsideDist = size / (6 / (newDist / speed * deceleration));
  			maxDistLower = maxDistLower + outsideDist;
  			speed = speed * maxDistLower / newDist;
  			newDist = maxDistLower;
  		}

  		newDist = newDist * (dist < 0 ? -1 : 1);
  		newTime = speed / deceleration;

  		return { dist: newDist, time: m.round(newTime) };
  	},

  	_offset: function (el) {
  		var left = -el.offsetLeft,
  			top = -el.offsetTop;
			
  		while (el = el.offsetParent) {
  			left -= el.offsetLeft;
  			top -= el.offsetTop;
  		}
		
  		if (el != this.wrapper) {
  			left *= this.scale;
  			top *= this.scale;
  		}

  		return { left: left, top: top };
  	},

  	_snap: function (x, y) {
  		var that = this,
  			i, l,
  			page, time,
  			sizeX, sizeY;

  		// Check page X
  		page = that.pagesX.length - 1;
  		for (i=0, l=that.pagesX.length; i<l; i++) {
  			if (x >= that.pagesX[i]) {
  				page = i;
  				break;
  			}
  		}
  		if (page == that.currPageX && page > 0 && that.dirX < 0) page--;
  		x = that.pagesX[page];
  		sizeX = m.abs(x - that.pagesX[that.currPageX]);
  		sizeX = sizeX ? m.abs(that.x - x) / sizeX * 500 : 0;
  		that.currPageX = page;

  		// Check page Y
  		page = that.pagesY.length-1;
  		for (i=0; i<page; i++) {
  			if (y >= that.pagesY[i]) {
  				page = i;
  				break;
  			}
  		}
  		if (page == that.currPageY && page > 0 && that.dirY < 0) page--;
  		y = that.pagesY[page];
  		sizeY = m.abs(y - that.pagesY[that.currPageY]);
  		sizeY = sizeY ? m.abs(that.y - y) / sizeY * 500 : 0;
  		that.currPageY = page;

  		// Snap with constant speed (proportional duration)
  		time = m.round(m.max(sizeX, sizeY)) || 200;

  		return { x: x, y: y, time: time };
  	},

  	_bind: function (type, el, bubble) {
  		(el || this.scroller).addEventListener(type, this, !!bubble);
  	},

  	_unbind: function (type, el, bubble) {
  		(el || this.scroller).removeEventListener(type, this, !!bubble);
  	},


  	/**
  	*
  	* Public methods
  	*
  	*/
  	destroy: function () {
  		var that = this;

  		that.scroller.style[transform] = '';

  		// Remove the scrollbars
  		that.hScrollbar = false;
  		that.vScrollbar = false;
  		that._scrollbar('h');
  		that._scrollbar('v');

  		// Remove the event listeners
  		that._unbind(RESIZE_EV, window);
  		that._unbind(START_EV);
  		that._unbind(MOVE_EV, window);
  		that._unbind(END_EV, window);
  		that._unbind(CANCEL_EV, window);
		
  		if (!that.options.hasTouch) {
  			that._unbind('DOMMouseScroll');
  			that._unbind('mousewheel');
  		}
		
  		if (that.options.useTransition) that._unbind(TRNEND_EV);
		
  		if (that.options.checkDOMChanges) clearInterval(that.checkDOMTime);
		
  		if (that.options.onDestroy) that.options.onDestroy.call(that);
  	},

  	refresh: function () {
  		var that = this,
  			offset,
  			i, l,
  			els,
  			pos = 0,
  			page = 0;

  		if (that.scale < that.options.zoomMin) that.scale = that.options.zoomMin;
  		that.wrapperW = that.wrapper.clientWidth || 1;
  		that.wrapperH = that.wrapper.clientHeight || 1;

  		that.minScrollY = -that.options.topOffset || 0;
  		that.scrollerW = m.round(that.scroller.offsetWidth * that.scale);
  		that.scrollerH = m.round((that.scroller.offsetHeight + that.minScrollY) * that.scale);
  		that.maxScrollX = that.wrapperW - that.scrollerW;
  		that.maxScrollY = that.wrapperH - that.scrollerH + that.minScrollY;
  		that.dirX = 0;
  		that.dirY = 0;

  		if (that.options.onRefresh) that.options.onRefresh.call(that);

  		that.hScroll = that.options.hScroll && that.maxScrollX < 0;
  		that.vScroll = that.options.vScroll && (!that.options.bounceLock && !that.hScroll || that.scrollerH > that.wrapperH);

  		that.hScrollbar = that.hScroll && that.options.hScrollbar;
  		that.vScrollbar = that.vScroll && that.options.vScrollbar && that.scrollerH > that.wrapperH;

  		offset = that._offset(that.wrapper);
  		that.wrapperOffsetLeft = -offset.left;
  		that.wrapperOffsetTop = -offset.top;

  		// Prepare snap
  		if (typeof that.options.snap == 'string') {
  			that.pagesX = [];
  			that.pagesY = [];
  			els = that.scroller.querySelectorAll(that.options.snap);
  			for (i=0, l=els.length; i<l; i++) {
  				pos = that._offset(els[i]);
  				pos.left += that.wrapperOffsetLeft;
  				pos.top += that.wrapperOffsetTop;
  				that.pagesX[i] = pos.left < that.maxScrollX ? that.maxScrollX : pos.left * that.scale;
  				that.pagesY[i] = pos.top < that.maxScrollY ? that.maxScrollY : pos.top * that.scale;
  			}
  		} else if (that.options.snap) {
  			that.pagesX = [];
  			while (pos >= that.maxScrollX) {
  				that.pagesX[page] = pos;
  				pos = pos - that.wrapperW;
  				page++;
  			}
  			if (that.maxScrollX%that.wrapperW) that.pagesX[that.pagesX.length] = that.maxScrollX - that.pagesX[that.pagesX.length-1] + that.pagesX[that.pagesX.length-1];

  			pos = 0;
  			page = 0;
  			that.pagesY = [];
  			while (pos >= that.maxScrollY) {
  				that.pagesY[page] = pos;
  				pos = pos - that.wrapperH;
  				page++;
  			}
  			if (that.maxScrollY%that.wrapperH) that.pagesY[that.pagesY.length] = that.maxScrollY - that.pagesY[that.pagesY.length-1] + that.pagesY[that.pagesY.length-1];
  		}

  		// Prepare the scrollbars
  		that._scrollbar('h');
  		that._scrollbar('v');

  		if (!that.zoomed) {
  			that.scroller.style[transitionDuration] = '0';
  			that._resetPos(400);
  		}
  	},

  	scrollTo: function (x, y, time, relative) {
  		var that = this,
  			step = x,
  			i, l;

  		that.stop();

  		if (!step.length) step = [{ x: x, y: y, time: time, relative: relative }];
		
  		for (i=0, l=step.length; i<l; i++) {
  			if (step[i].relative) { step[i].x = that.x - step[i].x; step[i].y = that.y - step[i].y; }
  			that.steps.push({ x: step[i].x, y: step[i].y, time: step[i].time || 0 });
  		}

  		that._startAni();
  	},

  	scrollToElement: function (el, time) {
  		var that = this, pos;
  		el = el.nodeType ? el : that.scroller.querySelector(el);
  		if (!el) return;

  		pos = that._offset(el);
  		pos.left += that.wrapperOffsetLeft;
  		pos.top += that.wrapperOffsetTop;

  		pos.left = pos.left > 0 ? 0 : pos.left < that.maxScrollX ? that.maxScrollX : pos.left;
  		pos.top = pos.top > that.minScrollY ? that.minScrollY : pos.top < that.maxScrollY ? that.maxScrollY : pos.top;
  		time = time === undefined ? m.max(m.abs(pos.left)*2, m.abs(pos.top)*2) : time;

  		that.scrollTo(pos.left, pos.top, time);
  	},

  	scrollToPage: function (pageX, pageY, time) {
  		var that = this, x, y;
		
  		time = time === undefined ? 400 : time;

  		if (that.options.onScrollStart) that.options.onScrollStart.call(that);

  		if (that.options.snap) {
  			pageX = pageX == 'next' ? that.currPageX+1 : pageX == 'prev' ? that.currPageX-1 : pageX;
  			pageY = pageY == 'next' ? that.currPageY+1 : pageY == 'prev' ? that.currPageY-1 : pageY;

  			pageX = pageX < 0 ? 0 : pageX > that.pagesX.length-1 ? that.pagesX.length-1 : pageX;
  			pageY = pageY < 0 ? 0 : pageY > that.pagesY.length-1 ? that.pagesY.length-1 : pageY;

  			that.currPageX = pageX;
  			that.currPageY = pageY;
  			x = that.pagesX[pageX];
  			y = that.pagesY[pageY];
  		} else {
  			x = -that.wrapperW * pageX;
  			y = -that.wrapperH * pageY;
  			if (x < that.maxScrollX) x = that.maxScrollX;
  			if (y < that.maxScrollY) y = that.maxScrollY;
  		}

  		that.scrollTo(x, y, time);
  	},

  	disable: function () {
  		this.stop();
  		this._resetPos(0);
  		this.enabled = false;

  		// If disabled after touchstart we make sure that there are no left over events
  		this._unbind(MOVE_EV, window);
  		this._unbind(END_EV, window);
  		this._unbind(CANCEL_EV, window);
  	},
	
  	enable: function () {
  		this.enabled = true;
  	},
	
  	stop: function () {
  		if (this.options.useTransition) this._unbind(TRNEND_EV);
  		else cancelFrame(this.aniTime);
  		this.steps = [];
  		this.moved = false;
  		this.animating = false;
  	},
	
  	zoom: function (x, y, scale, time) {
  		var that = this,
  			relScale = scale / that.scale;

  		if (!that.options.useTransform) return;

  		that.zoomed = true;
  		time = time === undefined ? 200 : time;
  		x = x - that.wrapperOffsetLeft - that.x;
  		y = y - that.wrapperOffsetTop - that.y;
  		that.x = x - x * relScale + that.x;
  		that.y = y - y * relScale + that.y;

  		that.scale = scale;
  		that.refresh();

  		that.x = that.x > 0 ? 0 : that.x < that.maxScrollX ? that.maxScrollX : that.x;
  		that.y = that.y > that.minScrollY ? that.minScrollY : that.y < that.maxScrollY ? that.maxScrollY : that.y;

  		that.scroller.style[transitionDuration] = time + 'ms';
  		that.scroller.style[transform] = 'translate(' + that.x + 'px,' + that.y + 'px) scale(' + scale + ')' + translateZ;
  		that.zoomed = false;
  	},
	
  	isReady: function () {
  		return !this.moved && !this.zoomed && !this.animating;
  	}
  };

  function prefixStyle (style) {
  	if ( vendor === '' ) return style;

  	style = style.charAt(0).toUpperCase() + style.substr(1);
  	return vendor + style;
  }

  dummyStyle = null;	// for the sake of it

  if (typeof exports !== 'undefined') exports.iScroll = iScroll;
  else window.iScroll = iScroll;

  })(window, document);

  if (typeof provide == "function") provide("iscroll", module.exports);

  !function ($, iScroll) {
    $.ender({
      iScroll: function (options) {
        return new iScroll(this[0], options)
      }
    }, true)
  }(ender, require('iscroll').iScroll)
}());

(function () {

  var module = { exports: {} }, exports = module.exports;

  /*!
    * domready (c) Dustin Diaz 2012 - License MIT
    */
  !function (name, definition) {
    if (typeof module != 'undefined') module.exports = definition()
    else if (typeof define == 'function' && typeof define.amd == 'object') define(definition)
    else this[name] = definition()
  }('domready', function (ready) {

    var fns = [], fn, f = false
      , doc = document
      , testEl = doc.documentElement
      , hack = testEl.doScroll
      , domContentLoaded = 'DOMContentLoaded'
      , addEventListener = 'addEventListener'
      , onreadystatechange = 'onreadystatechange'
      , readyState = 'readyState'
      , loaded = /^loade|c/.test(doc[readyState])

    function flush(f) {
      loaded = 1
      while (f = fns.shift()) f()
    }

    doc[addEventListener] && doc[addEventListener](domContentLoaded, fn = function () {
      doc.removeEventListener(domContentLoaded, fn, f)
      flush()
    }, f)


    hack && doc.attachEvent(onreadystatechange, fn = function () {
      if (/^c/.test(doc[readyState])) {
        doc.detachEvent(onreadystatechange, fn)
        flush()
      }
    })

    return (ready = hack ?
      function (fn) {
        self != top ?
          loaded ? fn() : fns.push(fn) :
          function () {
            try {
              testEl.doScroll('left')
            } catch (e) {
              return setTimeout(function() { ready(fn) }, 50)
            }
            fn()
          }()
      } :
      function (fn) {
        loaded ? fn() : fns.push(fn)
      })
  })
  if (typeof provide == "function") provide("domready", module.exports);

  !function ($) {
    var ready = require('domready')
    $.ender({domReady: ready})
    $.ender({
      ready: function (f) {
        ready(f)
        return this
      }
    }, true)
  }(ender);
}());

(function () {

  var module = { exports: {} }, exports = module.exports;

  /*!
    * @preserve Qwery - A Blazing Fast query selector engine
    * https://github.com/ded/qwery
    * copyright Dustin Diaz 2012
    * MIT License
    */

  (function (name, context, definition) {
    if (typeof module != 'undefined' && module.exports) module.exports = definition()
    else if (typeof define == 'function' && define.amd) define(definition)
    else context[name] = definition()
  })('qwery', this, function () {
    var doc = document
      , html = doc.documentElement
      , byClass = 'getElementsByClassName'
      , byTag = 'getElementsByTagName'
      , qSA = 'querySelectorAll'
      , useNativeQSA = 'useNativeQSA'
      , tagName = 'tagName'
      , nodeType = 'nodeType'
      , select // main select() method, assign later

      , id = /#([\w\-]+)/
      , clas = /\.[\w\-]+/g
      , idOnly = /^#([\w\-]+)$/
      , classOnly = /^\.([\w\-]+)$/
      , tagOnly = /^([\w\-]+)$/
      , tagAndOrClass = /^([\w]+)?\.([\w\-]+)$/
      , splittable = /(^|,)\s*[>~+]/
      , normalizr = /^\s+|\s*([,\s\+\~>]|$)\s*/g
      , splitters = /[\s\>\+\~]/
      , splittersMore = /(?![\s\w\-\/\?\&\=\:\.\(\)\!,@#%<>\{\}\$\*\^'"]*\]|[\s\w\+\-]*\))/
      , specialChars = /([.*+?\^=!:${}()|\[\]\/\\])/g
      , simple = /^(\*|[a-z0-9]+)?(?:([\.\#]+[\w\-\.#]+)?)/
      , attr = /\[([\w\-]+)(?:([\|\^\$\*\~]?\=)['"]?([ \w\-\/\?\&\=\:\.\(\)\!,@#%<>\{\}\$\*\^]+)["']?)?\]/
      , pseudo = /:([\w\-]+)(\(['"]?([^()]+)['"]?\))?/
      , easy = new RegExp(idOnly.source + '|' + tagOnly.source + '|' + classOnly.source)
      , dividers = new RegExp('(' + splitters.source + ')' + splittersMore.source, 'g')
      , tokenizr = new RegExp(splitters.source + splittersMore.source)
      , chunker = new RegExp(simple.source + '(' + attr.source + ')?' + '(' + pseudo.source + ')?')

    var walker = {
        ' ': function (node) {
          return node && node !== html && node.parentNode
        }
      , '>': function (node, contestant) {
          return node && node.parentNode == contestant.parentNode && node.parentNode
        }
      , '~': function (node) {
          return node && node.previousSibling
        }
      , '+': function (node, contestant, p1, p2) {
          if (!node) return false
          return (p1 = previous(node)) && (p2 = previous(contestant)) && p1 == p2 && p1
        }
      }

    function cache() {
      this.c = {}
    }
    cache.prototype = {
      g: function (k) {
        return this.c[k] || undefined
      }
    , s: function (k, v, r) {
        v = r ? new RegExp(v) : v
        return (this.c[k] = v)
      }
    }

    var classCache = new cache()
      , cleanCache = new cache()
      , attrCache = new cache()
      , tokenCache = new cache()

    function classRegex(c) {
      return classCache.g(c) || classCache.s(c, '(^|\\s+)' + c + '(\\s+|$)', 1)
    }

    // not quite as fast as inline loops in older browsers so don't use liberally
    function each(a, fn) {
      var i = 0, l = a.length
      for (; i < l; i++) fn(a[i])
    }

    function flatten(ar) {
      for (var r = [], i = 0, l = ar.length; i < l; ++i) arrayLike(ar[i]) ? (r = r.concat(ar[i])) : (r[r.length] = ar[i])
      return r
    }

    function arrayify(ar) {
      var i = 0, l = ar.length, r = []
      for (; i < l; i++) r[i] = ar[i]
      return r
    }

    function previous(n) {
      while (n = n.previousSibling) if (n[nodeType] == 1) break;
      return n
    }

    function q(query) {
      return query.match(chunker)
    }

    // called using `this` as element and arguments from regex group results.
    // given => div.hello[title="world"]:foo('bar')
    // div.hello[title="world"]:foo('bar'), div, .hello, [title="world"], title, =, world, :foo('bar'), foo, ('bar'), bar]
    function interpret(whole, tag, idsAndClasses, wholeAttribute, attribute, qualifier, value, wholePseudo, pseudo, wholePseudoVal, pseudoVal) {
      var i, m, k, o, classes
      if (this[nodeType] !== 1) return false
      if (tag && tag !== '*' && this[tagName] && this[tagName].toLowerCase() !== tag) return false
      if (idsAndClasses && (m = idsAndClasses.match(id)) && m[1] !== this.id) return false
      if (idsAndClasses && (classes = idsAndClasses.match(clas))) {
        for (i = classes.length; i--;) if (!classRegex(classes[i].slice(1)).test(this.className)) return false
      }
      if (pseudo && qwery.pseudos[pseudo] && !qwery.pseudos[pseudo](this, pseudoVal)) return false
      if (wholeAttribute && !value) { // select is just for existance of attrib
        o = this.attributes
        for (k in o) {
          if (Object.prototype.hasOwnProperty.call(o, k) && (o[k].name || k) == attribute) {
            return this
          }
        }
      }
      if (wholeAttribute && !checkAttr(qualifier, getAttr(this, attribute) || '', value)) {
        // select is for attrib equality
        return false
      }
      return this
    }

    function clean(s) {
      return cleanCache.g(s) || cleanCache.s(s, s.replace(specialChars, '\\$1'))
    }

    function checkAttr(qualify, actual, val) {
      switch (qualify) {
      case '=':
        return actual == val
      case '^=':
        return actual.match(attrCache.g('^=' + val) || attrCache.s('^=' + val, '^' + clean(val), 1))
      case '$=':
        return actual.match(attrCache.g('$=' + val) || attrCache.s('$=' + val, clean(val) + '$', 1))
      case '*=':
        return actual.match(attrCache.g(val) || attrCache.s(val, clean(val), 1))
      case '~=':
        return actual.match(attrCache.g('~=' + val) || attrCache.s('~=' + val, '(?:^|\\s+)' + clean(val) + '(?:\\s+|$)', 1))
      case '|=':
        return actual.match(attrCache.g('|=' + val) || attrCache.s('|=' + val, '^' + clean(val) + '(-|$)', 1))
      }
      return 0
    }

    // given a selector, first check for simple cases then collect all base candidate matches and filter
    function _qwery(selector, _root) {
      var r = [], ret = [], i, l, m, token, tag, els, intr, item, root = _root
        , tokens = tokenCache.g(selector) || tokenCache.s(selector, selector.split(tokenizr))
        , dividedTokens = selector.match(dividers)

      if (!tokens.length) return r

      token = (tokens = tokens.slice(0)).pop() // copy cached tokens, take the last one
      if (tokens.length && (m = tokens[tokens.length - 1].match(idOnly))) root = byId(_root, m[1])
      if (!root) return r

      intr = q(token)
      // collect base candidates to filter
      els = root !== _root && root[nodeType] !== 9 && dividedTokens && /^[+~]$/.test(dividedTokens[dividedTokens.length - 1]) ?
        function (r) {
          while (root = root.nextSibling) {
            root[nodeType] == 1 && (intr[1] ? intr[1] == root[tagName].toLowerCase() : 1) && (r[r.length] = root)
          }
          return r
        }([]) :
        root[byTag](intr[1] || '*')
      // filter elements according to the right-most part of the selector
      for (i = 0, l = els.length; i < l; i++) {
        if (item = interpret.apply(els[i], intr)) r[r.length] = item
      }
      if (!tokens.length) return r

      // filter further according to the rest of the selector (the left side)
      each(r, function (e) { if (ancestorMatch(e, tokens, dividedTokens)) ret[ret.length] = e })
      return ret
    }

    // compare element to a selector
    function is(el, selector, root) {
      if (isNode(selector)) return el == selector
      if (arrayLike(selector)) return !!~flatten(selector).indexOf(el) // if selector is an array, is el a member?

      var selectors = selector.split(','), tokens, dividedTokens
      while (selector = selectors.pop()) {
        tokens = tokenCache.g(selector) || tokenCache.s(selector, selector.split(tokenizr))
        dividedTokens = selector.match(dividers)
        tokens = tokens.slice(0) // copy array
        if (interpret.apply(el, q(tokens.pop())) && (!tokens.length || ancestorMatch(el, tokens, dividedTokens, root))) {
          return true
        }
      }
      return false
    }

    // given elements matching the right-most part of a selector, filter out any that don't match the rest
    function ancestorMatch(el, tokens, dividedTokens, root) {
      var cand
      // recursively work backwards through the tokens and up the dom, covering all options
      function crawl(e, i, p) {
        while (p = walker[dividedTokens[i]](p, e)) {
          if (isNode(p) && (interpret.apply(p, q(tokens[i])))) {
            if (i) {
              if (cand = crawl(p, i - 1, p)) return cand
            } else return p
          }
        }
      }
      return (cand = crawl(el, tokens.length - 1, el)) && (!root || isAncestor(cand, root))
    }

    function isNode(el, t) {
      return el && typeof el === 'object' && (t = el[nodeType]) && (t == 1 || t == 9)
    }

    function uniq(ar) {
      var a = [], i, j;
      o:
      for (i = 0; i < ar.length; ++i) {
        for (j = 0; j < a.length; ++j) if (a[j] == ar[i]) continue o
        a[a.length] = ar[i]
      }
      return a
    }

    function arrayLike(o) {
      return (typeof o === 'object' && isFinite(o.length))
    }

    function normalizeRoot(root) {
      if (!root) return doc
      if (typeof root == 'string') return qwery(root)[0]
      if (!root[nodeType] && arrayLike(root)) return root[0]
      return root
    }

    function byId(root, id, el) {
      // if doc, query on it, else query the parent doc or if a detached fragment rewrite the query and run on the fragment
      return root[nodeType] === 9 ? root.getElementById(id) :
        root.ownerDocument &&
          (((el = root.ownerDocument.getElementById(id)) && isAncestor(el, root) && el) ||
            (!isAncestor(root, root.ownerDocument) && select('[id="' + id + '"]', root)[0]))
    }

    function qwery(selector, _root) {
      var m, el, root = normalizeRoot(_root)

      // easy, fast cases that we can dispatch with simple DOM calls
      if (!root || !selector) return []
      if (selector === window || isNode(selector)) {
        return !_root || (selector !== window && isNode(root) && isAncestor(selector, root)) ? [selector] : []
      }
      if (selector && arrayLike(selector)) return flatten(selector)
      if (m = selector.match(easy)) {
        if (m[1]) return (el = byId(root, m[1])) ? [el] : []
        if (m[2]) return arrayify(root[byTag](m[2]))
        if (hasByClass && m[3]) return arrayify(root[byClass](m[3]))
      }

      return select(selector, root)
    }

    // where the root is not document and a relationship selector is first we have to
    // do some awkward adjustments to get it to work, even with qSA
    function collectSelector(root, collector) {
      return function (s) {
        var oid, nid
        if (splittable.test(s)) {
          if (root[nodeType] !== 9) {
            // make sure the el has an id, rewrite the query, set root to doc and run it
            if (!(nid = oid = root.getAttribute('id'))) root.setAttribute('id', nid = '__qwerymeupscotty')
            s = '[id="' + nid + '"]' + s // avoid byId and allow us to match context element
            collector(root.parentNode || root, s, true)
            oid || root.removeAttribute('id')
          }
          return;
        }
        s.length && collector(root, s, false)
      }
    }

    var isAncestor = 'compareDocumentPosition' in html ?
      function (element, container) {
        return (container.compareDocumentPosition(element) & 16) == 16
      } : 'contains' in html ?
      function (element, container) {
        container = container[nodeType] === 9 || container == window ? html : container
        return container !== element && container.contains(element)
      } :
      function (element, container) {
        while (element = element.parentNode) if (element === container) return 1
        return 0
      }
    , getAttr = function () {
        // detect buggy IE src/href getAttribute() call
        var e = doc.createElement('p')
        return ((e.innerHTML = '<a href="#x">x</a>') && e.firstChild.getAttribute('href') != '#x') ?
          function (e, a) {
            return a === 'class' ? e.className : (a === 'href' || a === 'src') ?
              e.getAttribute(a, 2) : e.getAttribute(a)
          } :
          function (e, a) { return e.getAttribute(a) }
      }()
    , hasByClass = !!doc[byClass]
      // has native qSA support
    , hasQSA = doc.querySelector && doc[qSA]
      // use native qSA
    , selectQSA = function (selector, root) {
        var result = [], ss, e
        try {
          if (root[nodeType] === 9 || !splittable.test(selector)) {
            // most work is done right here, defer to qSA
            return arrayify(root[qSA](selector))
          }
          // special case where we need the services of `collectSelector()`
          each(ss = selector.split(','), collectSelector(root, function (ctx, s) {
            e = ctx[qSA](s)
            if (e.length == 1) result[result.length] = e.item(0)
            else if (e.length) result = result.concat(arrayify(e))
          }))
          return ss.length > 1 && result.length > 1 ? uniq(result) : result
        } catch (ex) { }
        return selectNonNative(selector, root)
      }
      // no native selector support
    , selectNonNative = function (selector, root) {
        var result = [], items, m, i, l, r, ss
        selector = selector.replace(normalizr, '$1')
        if (m = selector.match(tagAndOrClass)) {
          r = classRegex(m[2])
          items = root[byTag](m[1] || '*')
          for (i = 0, l = items.length; i < l; i++) {
            if (r.test(items[i].className)) result[result.length] = items[i]
          }
          return result
        }
        // more complex selector, get `_qwery()` to do the work for us
        each(ss = selector.split(','), collectSelector(root, function (ctx, s, rewrite) {
          r = _qwery(s, ctx)
          for (i = 0, l = r.length; i < l; i++) {
            if (ctx[nodeType] === 9 || rewrite || isAncestor(r[i], root)) result[result.length] = r[i]
          }
        }))
        return ss.length > 1 && result.length > 1 ? uniq(result) : result
      }
    , configure = function (options) {
        // configNativeQSA: use fully-internal selector or native qSA where present
        if (typeof options[useNativeQSA] !== 'undefined')
          select = !options[useNativeQSA] ? selectNonNative : hasQSA ? selectQSA : selectNonNative
      }

    configure({ useNativeQSA: true })

    qwery.configure = configure
    qwery.uniq = uniq
    qwery.is = is
    qwery.pseudos = {}

    return qwery
  });

  if (typeof provide == "function") provide("qwery", module.exports);

  (function ($) {
    var q = function () {
      var r
      try {
        r = require('qwery')
      } catch (ex) {
        r = require('qwery-mobile')
      } finally {
        return r
      }
    }()

    $.pseudos = q.pseudos

    $._select = function (s, r) {
      // detect if sibling module 'bonzo' is available at run-time
      // rather than load-time since technically it's not a dependency and
      // can be loaded in any order
      // hence the lazy function re-definition
      return ($._select = (function () {
        var b
        if (typeof $.create == 'function') return function (s, r) {
          return /^\s*</.test(s) ? $.create(s, r) : q(s, r)
        }
        try {
          b = require('bonzo')
          return function (s, r) {
            return /^\s*</.test(s) ? b.create(s, r) : q(s, r)
          }
        } catch (e) { }
        return q
      })())(s, r)
    }

    $.ender({
        find: function (s) {
          var r = [], i, l, j, k, els
          for (i = 0, l = this.length; i < l; i++) {
            els = q(s, this[i])
            for (j = 0, k = els.length; j < k; j++) r.push(els[j])
          }
          return $(q.uniq(r))
        }
      , and: function (s) {
          var plus = $(s)
          for (var i = this.length, j = 0, l = this.length + plus.length; i < l; i++, j++) {
            this[i] = plus[j]
          }
          this.length += plus.length
          return this
        }
      , is: function(s, r) {
          var i, l
          for (i = 0, l = this.length; i < l; i++) {
            if (q.is(this[i], s, r)) {
              return true
            }
          }
          return false
        }
    }, true)
  }(ender));

}());

(function () {

  var module = { exports: {} }, exports = module.exports;

  /*!
    * Bonzo: DOM Utility (c) Dustin Diaz 2012
    * https://github.com/ded/bonzo
    * License MIT
    */
  (function (name, context, definition) {
    if (typeof module != 'undefined' && module.exports) module.exports = definition()
    else if (typeof define == 'function' && define.amd) define(definition)
    else context[name] = definition()
  })('bonzo', this, function() {
    var win = window
      , doc = win.document
      , html = doc.documentElement
      , parentNode = 'parentNode'
      , specialAttributes = /^(checked|value|selected|disabled)$/i
        // tags that we have trouble inserting *into*
      , specialTags = /^(select|fieldset|table|tbody|tfoot|td|tr|colgroup)$/i
      , simpleScriptTagRe = /\s*<script +src=['"]([^'"]+)['"]>/
      , table = ['<table>', '</table>', 1]
      , td = ['<table><tbody><tr>', '</tr></tbody></table>', 3]
      , option = ['<select>', '</select>', 1]
      , noscope = ['_', '', 0, 1]
      , tagMap = { // tags that we have trouble *inserting*
            thead: table, tbody: table, tfoot: table, colgroup: table, caption: table
          , tr: ['<table><tbody>', '</tbody></table>', 2]
          , th: td , td: td
          , col: ['<table><colgroup>', '</colgroup></table>', 2]
          , fieldset: ['<form>', '</form>', 1]
          , legend: ['<form><fieldset>', '</fieldset></form>', 2]
          , option: option, optgroup: option
          , script: noscope, style: noscope, link: noscope, param: noscope, base: noscope
        }
      , stateAttributes = /^(checked|selected|disabled)$/
      , ie = /msie/i.test(navigator.userAgent)
      , hasClass, addClass, removeClass
      , uidMap = {}
      , uuids = 0
      , digit = /^-?[\d\.]+$/
      , dattr = /^data-(.+)$/
      , px = 'px'
      , setAttribute = 'setAttribute'
      , getAttribute = 'getAttribute'
      , byTag = 'getElementsByTagName'
      , features = function() {
          var e = doc.createElement('p')
          e.innerHTML = '<a href="#x">x</a><table style="float:left;"></table>'
          return {
            hrefExtended: e[byTag]('a')[0][getAttribute]('href') != '#x' // IE < 8
          , autoTbody: e[byTag]('tbody').length !== 0 // IE < 8
          , computedStyle: doc.defaultView && doc.defaultView.getComputedStyle
          , cssFloat: e[byTag]('table')[0].style.styleFloat ? 'styleFloat' : 'cssFloat'
          , transform: function () {
              var props = ['transform', 'webkitTransform', 'MozTransform', 'OTransform', 'msTransform'], i
              for (i = 0; i < props.length; i++) {
                if (props[i] in e.style) return props[i]
              }
            }()
          , classList: 'classList' in e
          , opasity: function () {
              return typeof doc.createElement('a').style.opacity !== 'undefined'
            }()
          }
        }()
      , trimReplace = /(^\s*|\s*$)/g
      , whitespaceRegex = /\s+/
      , toString = String.prototype.toString
      , unitless = { lineHeight: 1, zoom: 1, zIndex: 1, opacity: 1, boxFlex: 1, WebkitBoxFlex: 1, MozBoxFlex: 1 }
      , query = doc.querySelectorAll && function (selector) { return doc.querySelectorAll(selector) }
      , trim = String.prototype.trim ?
          function (s) {
            return s.trim()
          } :
          function (s) {
            return s.replace(trimReplace, '')
          }

      , getStyle = features.computedStyle
          ? function (el, property) {
              var value = null
                , computed = doc.defaultView.getComputedStyle(el, '')
              computed && (value = computed[property])
              return el.style[property] || value
            }
          : !(ie && html.currentStyle)
            ? function (el, property) {
                return el.style[property]
              }
            :
            /**
             * @param {Element} el
             * @param {string} property
             * @return {string|number}
             */
            function (el, property) {
              var val, value
              if (property == 'opacity' && !features.opasity) {
                val = 100
                try {
                  val = el['filters']['DXImageTransform.Microsoft.Alpha'].opacity
                } catch (e1) {
                  try {
                    val = el['filters']('alpha').opacity
                  } catch (e2) {}
                }
                return val / 100
              }
              value = el.currentStyle ? el.currentStyle[property] : null
              return el.style[property] || value
            }

    function isNode(node) {
      return node && node.nodeName && (node.nodeType == 1 || node.nodeType == 11)
    }


    function normalize(node, host, clone) {
      var i, l, ret
      if (typeof node == 'string') return bonzo.create(node)
      if (isNode(node)) node = [ node ]
      if (clone) {
        ret = [] // don't change original array
        for (i = 0, l = node.length; i < l; i++) ret[i] = cloneNode(host, node[i])
        return ret
      }
      return node
    }

    /**
     * @param {string} c a class name to test
     * @return {boolean}
     */
    function classReg(c) {
      return new RegExp('(^|\\s+)' + c + '(\\s+|$)')
    }


    /**
     * @param {Bonzo|Array} ar
     * @param {function(Object, number, (Bonzo|Array))} fn
     * @param {Object=} opt_scope
     * @param {boolean=} opt_rev
     * @return {Bonzo|Array}
     */
    function each(ar, fn, opt_scope, opt_rev) {
      var ind, i = 0, l = ar.length
      for (; i < l; i++) {
        ind = opt_rev ? ar.length - i - 1 : i
        fn.call(opt_scope || ar[ind], ar[ind], ind, ar)
      }
      return ar
    }


    /**
     * @param {Bonzo|Array} ar
     * @param {function(Object, number, (Bonzo|Array))} fn
     * @param {Object=} opt_scope
     * @return {Bonzo|Array}
     */
    function deepEach(ar, fn, opt_scope) {
      for (var i = 0, l = ar.length; i < l; i++) {
        if (isNode(ar[i])) {
          deepEach(ar[i].childNodes, fn, opt_scope)
          fn.call(opt_scope || ar[i], ar[i], i, ar)
        }
      }
      return ar
    }


    /**
     * @param {string} s
     * @return {string}
     */
    function camelize(s) {
      return s.replace(/-(.)/g, function (m, m1) {
        return m1.toUpperCase()
      })
    }


    /**
     * @param {string} s
     * @return {string}
     */
    function decamelize(s) {
      return s ? s.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase() : s
    }


    /**
     * @param {Element} el
     * @return {*}
     */
    function data(el) {
      el[getAttribute]('data-node-uid') || el[setAttribute]('data-node-uid', ++uuids)
      var uid = el[getAttribute]('data-node-uid')
      return uidMap[uid] || (uidMap[uid] = {})
    }


    /**
     * removes the data associated with an element
     * @param {Element} el
     */
    function clearData(el) {
      var uid = el[getAttribute]('data-node-uid')
      if (uid) delete uidMap[uid]
    }


    function dataValue(d) {
      var f
      try {
        return (d === null || d === undefined) ? undefined :
          d === 'true' ? true :
            d === 'false' ? false :
              d === 'null' ? null :
                (f = parseFloat(d)) == d ? f : d;
      } catch(e) {}
      return undefined
    }


    /**
     * @param {Bonzo|Array} ar
     * @param {function(Object, number, (Bonzo|Array))} fn
     * @param {Object=} opt_scope
     * @return {boolean} whether `some`thing was found
     */
    function some(ar, fn, opt_scope) {
      for (var i = 0, j = ar.length; i < j; ++i) if (fn.call(opt_scope || null, ar[i], i, ar)) return true
      return false
    }


    /**
     * this could be a giant enum of CSS properties
     * but in favor of file size sans-closure deadcode optimizations
     * we're just asking for any ol string
     * then it gets transformed into the appropriate style property for JS access
     * @param {string} p
     * @return {string}
     */
    function styleProperty(p) {
        (p == 'transform' && (p = features.transform)) ||
          (/^transform-?[Oo]rigin$/.test(p) && (p = features.transform + 'Origin')) ||
          (p == 'float' && (p = features.cssFloat))
        return p ? camelize(p) : null
    }

    // this insert method is intense
    function insert(target, host, fn, rev) {
      var i = 0, self = host || this, r = []
        // target nodes could be a css selector if it's a string and a selector engine is present
        // otherwise, just use target
        , nodes = query && typeof target == 'string' && target.charAt(0) != '<' ? query(target) : target
      // normalize each node in case it's still a string and we need to create nodes on the fly
      each(normalize(nodes), function (t, j) {
        each(self, function (el) {
          fn(t, r[i++] = j > 0 ? cloneNode(self, el) : el)
        }, null, rev)
      }, this, rev)
      self.length = i
      each(r, function (e) {
        self[--i] = e
      }, null, !rev)
      return self
    }


    /**
     * sets an element to an explicit x/y position on the page
     * @param {Element} el
     * @param {?number} x
     * @param {?number} y
     */
    function xy(el, x, y) {
      var $el = bonzo(el)
        , style = $el.css('position')
        , offset = $el.offset()
        , rel = 'relative'
        , isRel = style == rel
        , delta = [parseInt($el.css('left'), 10), parseInt($el.css('top'), 10)]

      if (style == 'static') {
        $el.css('position', rel)
        style = rel
      }

      isNaN(delta[0]) && (delta[0] = isRel ? 0 : el.offsetLeft)
      isNaN(delta[1]) && (delta[1] = isRel ? 0 : el.offsetTop)

      x != null && (el.style.left = x - offset.left + delta[0] + px)
      y != null && (el.style.top = y - offset.top + delta[1] + px)

    }

    // classList support for class management
    // altho to be fair, the api sucks because it won't accept multiple classes at once
    if (features.classList) {
      hasClass = function (el, c) {
        return el.classList.contains(c)
      }
      addClass = function (el, c) {
        el.classList.add(c)
      }
      removeClass = function (el, c) {
        el.classList.remove(c)
      }
    }
    else {
      hasClass = function (el, c) {
        return classReg(c).test(el.className)
      }
      addClass = function (el, c) {
        el.className = trim(el.className + ' ' + c)
      }
      removeClass = function (el, c) {
        el.className = trim(el.className.replace(classReg(c), ' '))
      }
    }


    /**
     * this allows method calling for setting values
     *
     * @example
     * bonzo(elements).css('color', function (el) {
     *   return el.getAttribute('data-original-color')
     * })
     *
     * @param {Element} el
     * @param {function (Element)|string}
     * @return {string}
     */
    function setter(el, v) {
      return typeof v == 'function' ? v(el) : v
    }

    function scroll(x, y, type) {
      var el = this[0]
      if (!el) return this
      if (x == null && y == null) {
        return (isBody(el) ? getWindowScroll() : { x: el.scrollLeft, y: el.scrollTop })[type]
      }
      if (isBody(el)) {
        win.scrollTo(x, y)
      } else {
        x != null && (el.scrollLeft = x)
        y != null && (el.scrollTop = y)
      }
      return this
    }

    /**
     * @constructor
     * @param {Array.<Element>|Element|Node|string} elements
     */
    function Bonzo(elements) {
      this.length = 0
      if (elements) {
        elements = typeof elements !== 'string' &&
          !elements.nodeType &&
          typeof elements.length !== 'undefined' ?
            elements :
            [elements]
        this.length = elements.length
        for (var i = 0; i < elements.length; i++) this[i] = elements[i]
      }
    }

    Bonzo.prototype = {

        /**
         * @param {number} index
         * @return {Element|Node}
         */
        get: function (index) {
          return this[index] || null
        }

        // itetators
        /**
         * @param {function(Element|Node)} fn
         * @param {Object=} opt_scope
         * @return {Bonzo}
         */
      , each: function (fn, opt_scope) {
          return each(this, fn, opt_scope)
        }

        /**
         * @param {Function} fn
         * @param {Object=} opt_scope
         * @return {Bonzo}
         */
      , deepEach: function (fn, opt_scope) {
          return deepEach(this, fn, opt_scope)
        }


        /**
         * @param {Function} fn
         * @param {Function=} opt_reject
         * @return {Array}
         */
      , map: function (fn, opt_reject) {
          var m = [], n, i
          for (i = 0; i < this.length; i++) {
            n = fn.call(this, this[i], i)
            opt_reject ? (opt_reject(n) && m.push(n)) : m.push(n)
          }
          return m
        }

      // text and html inserters!

      /**
       * @param {string} h the HTML to insert
       * @param {boolean=} opt_text whether to set or get text content
       * @return {Bonzo|string}
       */
      , html: function (h, opt_text) {
          var method = opt_text
                ? html.textContent === undefined ? 'innerText' : 'textContent'
                : 'innerHTML'
            , that = this
            , append = function (el, i) {
                each(normalize(h, that, i), function (node) {
                  el.appendChild(node)
                })
              }
            , updateElement = function (el, i) {
                try {
                  if (opt_text || (typeof h == 'string' && !specialTags.test(el.tagName))) {
                    return el[method] = h
                  }
                } catch (e) {}
                append(el, i)
              }
          return typeof h != 'undefined'
            ? this.empty().each(updateElement)
            : this[0] ? this[0][method] : ''
        }

        /**
         * @param {string=} opt_text the text to set, otherwise this is a getter
         * @return {Bonzo|string}
         */
      , text: function (opt_text) {
          return this.html(opt_text, true)
        }

        // more related insertion methods

        /**
         * @param {Bonzo|string|Element|Array} node
         * @return {Bonzo}
         */
      , append: function (node) {
          var that = this
          return this.each(function (el, i) {
            each(normalize(node, that, i), function (i) {
              el.appendChild(i)
            })
          })
        }


        /**
         * @param {Bonzo|string|Element|Array} node
         * @return {Bonzo}
         */
      , prepend: function (node) {
          var that = this
          return this.each(function (el, i) {
            var first = el.firstChild
            each(normalize(node, that, i), function (i) {
              el.insertBefore(i, first)
            })
          })
        }


        /**
         * @param {Bonzo|string|Element|Array} target the location for which you'll insert your new content
         * @param {Object=} opt_host an optional host scope (primarily used when integrated with Ender)
         * @return {Bonzo}
         */
      , appendTo: function (target, opt_host) {
          return insert.call(this, target, opt_host, function (t, el) {
            t.appendChild(el)
          })
        }


        /**
         * @param {Bonzo|string|Element|Array} target the location for which you'll insert your new content
         * @param {Object=} opt_host an optional host scope (primarily used when integrated with Ender)
         * @return {Bonzo}
         */
      , prependTo: function (target, opt_host) {
          return insert.call(this, target, opt_host, function (t, el) {
            t.insertBefore(el, t.firstChild)
          }, 1)
        }


        /**
         * @param {Bonzo|string|Element|Array} node
         * @return {Bonzo}
         */
      , before: function (node) {
          var that = this
          return this.each(function (el, i) {
            each(normalize(node, that, i), function (i) {
              el[parentNode].insertBefore(i, el)
            })
          })
        }


        /**
         * @param {Bonzo|string|Element|Array} node
         * @return {Bonzo}
         */
      , after: function (node) {
          var that = this
          return this.each(function (el, i) {
            each(normalize(node, that, i), function (i) {
              el[parentNode].insertBefore(i, el.nextSibling)
            }, null, 1)
          })
        }


        /**
         * @param {Bonzo|string|Element|Array} target the location for which you'll insert your new content
         * @param {Object=} opt_host an optional host scope (primarily used when integrated with Ender)
         * @return {Bonzo}
         */
      , insertBefore: function (target, opt_host) {
          return insert.call(this, target, opt_host, function (t, el) {
            t[parentNode].insertBefore(el, t)
          })
        }


        /**
         * @param {Bonzo|string|Element|Array} target the location for which you'll insert your new content
         * @param {Object=} opt_host an optional host scope (primarily used when integrated with Ender)
         * @return {Bonzo}
         */
      , insertAfter: function (target, opt_host) {
          return insert.call(this, target, opt_host, function (t, el) {
            var sibling = t.nextSibling
            sibling ?
              t[parentNode].insertBefore(el, sibling) :
              t[parentNode].appendChild(el)
          }, 1)
        }


        /**
         * @param {Bonzo|string|Element|Array} node
         * @return {Bonzo}
         */
      , replaceWith: function (node) {
          bonzo(normalize(node)).insertAfter(this)
          return this.remove()
        }

        /**
         * @param {Object=} opt_host an optional host scope (primarily used when integrated with Ender)
         * @return {Bonzo}
         */
      , clone: function (opt_host) {
          var ret = [] // don't change original array
            , l, i
          for (i = 0, l = this.length; i < l; i++) ret[i] = cloneNode(opt_host || this, this[i])
          return bonzo(ret)
        }

        // class management

        /**
         * @param {string} c
         * @return {Bonzo}
         */
      , addClass: function (c) {
          c = toString.call(c).split(whitespaceRegex)
          return this.each(function (el) {
            // we `each` here so you can do $el.addClass('foo bar')
            each(c, function (c) {
              if (c && !hasClass(el, setter(el, c)))
                addClass(el, setter(el, c))
            })
          })
        }


        /**
         * @param {string} c
         * @return {Bonzo}
         */
      , removeClass: function (c) {
          c = toString.call(c).split(whitespaceRegex)
          return this.each(function (el) {
            each(c, function (c) {
              if (c && hasClass(el, setter(el, c)))
                removeClass(el, setter(el, c))
            })
          })
        }


        /**
         * @param {string} c
         * @return {boolean}
         */
      , hasClass: function (c) {
          c = toString.call(c).split(whitespaceRegex)
          return some(this, function (el) {
            return some(c, function (c) {
              return c && hasClass(el, c)
            })
          })
        }


        /**
         * @param {string} c classname to toggle
         * @param {boolean=} opt_condition whether to add or remove the class straight away
         * @return {Bonzo}
         */
      , toggleClass: function (c, opt_condition) {
          c = toString.call(c).split(whitespaceRegex)
          return this.each(function (el) {
            each(c, function (c) {
              if (c) {
                typeof opt_condition !== 'undefined' ?
                  opt_condition ? !hasClass(el, c) && addClass(el, c) : removeClass(el, c) :
                  hasClass(el, c) ? removeClass(el, c) : addClass(el, c)
              }
            })
          })
        }

        // display togglers

        /**
         * @param {string=} opt_type useful to set back to anything other than an empty string
         * @return {Bonzo}
         */
      , show: function (opt_type) {
          opt_type = typeof opt_type == 'string' ? opt_type : ''
          return this.each(function (el) {
            el.style.display = opt_type
          })
        }


        /**
         * @return {Bonzo}
         */
      , hide: function () {
          return this.each(function (el) {
            el.style.display = 'none'
          })
        }


        /**
         * @param {Function=} opt_callback
         * @param {string=} opt_type
         * @return {Bonzo}
         */
      , toggle: function (opt_callback, opt_type) {
          opt_type = typeof opt_type == 'string' ? opt_type : '';
          typeof opt_callback != 'function' && (opt_callback = null)
          return this.each(function (el) {
            el.style.display = (el.offsetWidth || el.offsetHeight) ? 'none' : opt_type;
            opt_callback && opt_callback.call(el)
          })
        }


        // DOM Walkers & getters

        /**
         * @return {Element|Node}
         */
      , first: function () {
          return bonzo(this.length ? this[0] : [])
        }


        /**
         * @return {Element|Node}
         */
      , last: function () {
          return bonzo(this.length ? this[this.length - 1] : [])
        }


        /**
         * @return {Element|Node}
         */
      , next: function () {
          return this.related('nextSibling')
        }


        /**
         * @return {Element|Node}
         */
      , previous: function () {
          return this.related('previousSibling')
        }


        /**
         * @return {Element|Node}
         */
      , parent: function() {
          return this.related(parentNode)
        }


        /**
         * @private
         * @param {string} method the directional DOM method
         * @return {Element|Node}
         */
      , related: function (method) {
          return bonzo(this.map(
            function (el) {
              el = el[method]
              while (el && el.nodeType !== 1) {
                el = el[method]
              }
              return el || 0
            },
            function (el) {
              return el
            }
          ))
        }


        /**
         * @return {Bonzo}
         */
      , focus: function () {
          this.length && this[0].focus()
          return this
        }


        /**
         * @return {Bonzo}
         */
      , blur: function () {
          this.length && this[0].blur()
          return this
        }

        // style getter setter & related methods

        /**
         * @param {Object|string} o
         * @param {string=} opt_v
         * @return {Bonzo|string}
         */
      , css: function (o, opt_v) {
          var p, iter = o
          // is this a request for just getting a style?
          if (opt_v === undefined && typeof o == 'string') {
            // repurpose 'v'
            opt_v = this[0]
            if (!opt_v) return null
            if (opt_v === doc || opt_v === win) {
              p = (opt_v === doc) ? bonzo.doc() : bonzo.viewport()
              return o == 'width' ? p.width : o == 'height' ? p.height : ''
            }
            return (o = styleProperty(o)) ? getStyle(opt_v, o) : null
          }

          if (typeof o == 'string') {
            iter = {}
            iter[o] = opt_v
          }

          if (ie && iter.opacity) {
            // oh this 'ol gamut
            iter.filter = 'alpha(opacity=' + (iter.opacity * 100) + ')'
            // give it layout
            iter.zoom = o.zoom || 1;
            delete iter.opacity;
          }

          function fn(el, p, v) {
            for (var k in iter) {
              if (iter.hasOwnProperty(k)) {
                v = iter[k];
                // change "5" to "5px" - unless you're line-height, which is allowed
                (p = styleProperty(k)) && digit.test(v) && !(p in unitless) && (v += px)
                try { el.style[p] = setter(el, v) } catch(e) {}
              }
            }
          }
          return this.each(fn)
        }


        /**
         * @param {number=} opt_x
         * @param {number=} opt_y
         * @return {Bonzo|number}
         */
      , offset: function (opt_x, opt_y) {
          if (opt_x && typeof opt_x == 'object' && (typeof opt_x.top == 'number' || typeof opt_x.left == 'number')) {
            return this.each(function (el) {
              xy(el, opt_x.left, opt_x.top)
            })
          } else if (typeof opt_x == 'number' || typeof opt_y == 'number') {
            return this.each(function (el) {
              xy(el, opt_x, opt_y)
            })
          }
          if (!this[0]) return {
              top: 0
            , left: 0
            , height: 0
            , width: 0
          }
          var el = this[0]
            , de = el.ownerDocument.documentElement
            , bcr = el.getBoundingClientRect()
            , scroll = getWindowScroll()
            , width = el.offsetWidth
            , height = el.offsetHeight
            , top = bcr.top + scroll.y - Math.max(0, de && de.clientTop, doc.body.clientTop)
            , left = bcr.left + scroll.x - Math.max(0, de && de.clientLeft, doc.body.clientLeft)

          return {
              top: top
            , left: left
            , height: height
            , width: width
          }
        }


        /**
         * @return {number}
         */
      , dim: function () {
          if (!this.length) return { height: 0, width: 0 }
          var el = this[0]
            , de = el.nodeType == 9 && el.documentElement // document
            , orig = !de && !!el.style && !el.offsetWidth && !el.offsetHeight ?
               // el isn't visible, can't be measured properly, so fix that
               function (t) {
                 var s = {
                     position: el.style.position || ''
                   , visibility: el.style.visibility || ''
                   , display: el.style.display || ''
                 }
                 t.first().css({
                     position: 'absolute'
                   , visibility: 'hidden'
                   , display: 'block'
                 })
                 return s
              }(this) : null
            , width = de
                ? Math.max(el.body.scrollWidth, el.body.offsetWidth, de.scrollWidth, de.offsetWidth, de.clientWidth)
                : el.offsetWidth
            , height = de
                ? Math.max(el.body.scrollHeight, el.body.offsetHeight, de.scrollHeight, de.offsetHeight, de.clientHeight)
                : el.offsetHeight

          orig && this.first().css(orig)
          return {
              height: height
            , width: width
          }
        }

        // attributes are hard. go shopping

        /**
         * @param {string} k an attribute to get or set
         * @param {string=} opt_v the value to set
         * @return {Bonzo|string}
         */
      , attr: function (k, opt_v) {
          var el = this[0]
            , n

          if (typeof k != 'string' && !(k instanceof String)) {
            for (n in k) {
              k.hasOwnProperty(n) && this.attr(n, k[n])
            }
            return this
          }

          return typeof opt_v == 'undefined' ?
            !el ? null : specialAttributes.test(k) ?
              stateAttributes.test(k) && typeof el[k] == 'string' ?
                true : el[k] : (k == 'href' || k =='src') && features.hrefExtended ?
                  el[getAttribute](k, 2) : el[getAttribute](k) :
            this.each(function (el) {
              specialAttributes.test(k) ? (el[k] = setter(el, opt_v)) : el[setAttribute](k, setter(el, opt_v))
            })
        }


        /**
         * @param {string} k
         * @return {Bonzo}
         */
      , removeAttr: function (k) {
          return this.each(function (el) {
            stateAttributes.test(k) ? (el[k] = false) : el.removeAttribute(k)
          })
        }


        /**
         * @param {string=} opt_s
         * @return {Bonzo|string}
         */
      , val: function (s) {
          return (typeof s == 'string') ?
            this.attr('value', s) :
            this.length ? this[0].value : null
        }

        // use with care and knowledge. this data() method uses data attributes on the DOM nodes
        // to do this differently costs a lot more code. c'est la vie
        /**
         * @param {string|Object=} opt_k the key for which to get or set data
         * @param {Object=} opt_v
         * @return {Bonzo|Object}
         */
      , data: function (opt_k, opt_v) {
          var el = this[0], o, m
          if (typeof opt_v === 'undefined') {
            if (!el) return null
            o = data(el)
            if (typeof opt_k === 'undefined') {
              each(el.attributes, function (a) {
                (m = ('' + a.name).match(dattr)) && (o[camelize(m[1])] = dataValue(a.value))
              })
              return o
            } else {
              if (typeof o[opt_k] === 'undefined')
                o[opt_k] = dataValue(this.attr('data-' + decamelize(opt_k)))
              return o[opt_k]
            }
          } else {
            return this.each(function (el) { data(el)[opt_k] = opt_v })
          }
        }

        // DOM detachment & related

        /**
         * @return {Bonzo}
         */
      , remove: function () {
          this.deepEach(clearData)
          return this.detach()
        }


        /**
         * @return {Bonzo}
         */
      , empty: function () {
          return this.each(function (el) {
            deepEach(el.childNodes, clearData)

            while (el.firstChild) {
              el.removeChild(el.firstChild)
            }
          })
        }


        /**
         * @return {Bonzo}
         */
      , detach: function () {
          return this.each(function (el) {
            el[parentNode] && el[parentNode].removeChild(el)
          })
        }

        // who uses a mouse anyway? oh right.

        /**
         * @param {number} y
         */
      , scrollTop: function (y) {
          return scroll.call(this, null, y, 'y')
        }


        /**
         * @param {number} x
         */
      , scrollLeft: function (x) {
          return scroll.call(this, x, null, 'x')
        }

    }


    function cloneNode(host, el) {
      var c = el.cloneNode(true)
        , cloneElems
        , elElems
        , i

      // check for existence of an event cloner
      // preferably https://github.com/fat/bean
      // otherwise Bonzo won't do this for you
      if (host.$ && typeof host.cloneEvents == 'function') {
        host.$(c).cloneEvents(el)

        // clone events from every child node
        cloneElems = host.$(c).find('*')
        elElems = host.$(el).find('*')

        for (i = 0; i < elElems.length; i++)
          host.$(cloneElems[i]).cloneEvents(elElems[i])
      }
      return c
    }

    function isBody(element) {
      return element === win || (/^(?:body|html)$/i).test(element.tagName)
    }

    function getWindowScroll() {
      return { x: win.pageXOffset || html.scrollLeft, y: win.pageYOffset || html.scrollTop }
    }

    function createScriptFromHtml(html) {
      var scriptEl = document.createElement('script')
        , matches = html.match(simpleScriptTagRe)
      scriptEl.src = matches[1]
      return scriptEl
    }

    /**
     * @param {Array.<Element>|Element|Node|string} els
     * @return {Bonzo}
     */
    function bonzo(els) {
      return new Bonzo(els)
    }

    bonzo.setQueryEngine = function (q) {
      query = q;
      delete bonzo.setQueryEngine
    }

    bonzo.aug = function (o, target) {
      // for those standalone bonzo users. this love is for you.
      for (var k in o) {
        o.hasOwnProperty(k) && ((target || Bonzo.prototype)[k] = o[k])
      }
    }

    bonzo.create = function (node) {
      // hhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhh
      return typeof node == 'string' && node !== '' ?
        function () {
          if (simpleScriptTagRe.test(node)) return [createScriptFromHtml(node)]
          var tag = node.match(/^\s*<([^\s>]+)/)
            , el = doc.createElement('div')
            , els = []
            , p = tag ? tagMap[tag[1].toLowerCase()] : null
            , dep = p ? p[2] + 1 : 1
            , ns = p && p[3]
            , pn = parentNode
            , tb = features.autoTbody && p && p[0] == '<table>' && !(/<tbody/i).test(node)

          el.innerHTML = p ? (p[0] + node + p[1]) : node
          while (dep--) el = el.firstChild
          // for IE NoScope, we may insert cruft at the begining just to get it to work
          if (ns && el && el.nodeType !== 1) el = el.nextSibling
          do {
            // tbody special case for IE<8, creates tbody on any empty table
            // we don't want it if we're just after a <thead>, <caption>, etc.
            if ((!tag || el.nodeType == 1) && (!tb || (el.tagName && el.tagName != 'TBODY'))) {
              els.push(el)
            }
          } while (el = el.nextSibling)
          // IE < 9 gives us a parentNode which messes up insert() check for cloning
          // `dep` > 1 can also cause problems with the insert() check (must do this last)
          each(els, function(el) { el[pn] && el[pn].removeChild(el) })
          return els
        }() : isNode(node) ? [node.cloneNode(true)] : []
    }

    bonzo.doc = function () {
      var vp = bonzo.viewport()
      return {
          width: Math.max(doc.body.scrollWidth, html.scrollWidth, vp.width)
        , height: Math.max(doc.body.scrollHeight, html.scrollHeight, vp.height)
      }
    }

    bonzo.firstChild = function (el) {
      for (var c = el.childNodes, i = 0, j = (c && c.length) || 0, e; i < j; i++) {
        if (c[i].nodeType === 1) e = c[j = i]
      }
      return e
    }

    bonzo.viewport = function () {
      return {
          width: ie ? html.clientWidth : self.innerWidth
        , height: ie ? html.clientHeight : self.innerHeight
      }
    }

    bonzo.isAncestor = 'compareDocumentPosition' in html ?
      function (container, element) {
        return (container.compareDocumentPosition(element) & 16) == 16
      } : 'contains' in html ?
      function (container, element) {
        return container !== element && container.contains(element);
      } :
      function (container, element) {
        while (element = element[parentNode]) {
          if (element === container) {
            return true
          }
        }
        return false
      }

    return bonzo
  }); // the only line we care about using a semi-colon. placed here for concatenation tools

  if (typeof provide == "function") provide("bonzo", module.exports);

  (function ($) {

    var b = require('bonzo')
    b.setQueryEngine($)
    $.ender(b)
    $.ender(b(), true)
    $.ender({
      create: function (node) {
        return $(b.create(node))
      }
    })

    $.id = function (id) {
      return $([document.getElementById(id)])
    }

    function indexOf(ar, val) {
      for (var i = 0; i < ar.length; i++) if (ar[i] === val) return i
      return -1
    }

    function uniq(ar) {
      var r = [], i = 0, j = 0, k, item, inIt
      for (; item = ar[i]; ++i) {
        inIt = false
        for (k = 0; k < r.length; ++k) {
          if (r[k] === item) {
            inIt = true; break
          }
        }
        if (!inIt) r[j++] = item
      }
      return r
    }

    $.ender({
      parents: function (selector, closest) {
        if (!this.length) return this
        if (!selector) selector = '*'
        var collection = $(selector), j, k, p, r = []
        for (j = 0, k = this.length; j < k; j++) {
          p = this[j]
          while (p = p.parentNode) {
            if (~indexOf(collection, p)) {
              r.push(p)
              if (closest) break;
            }
          }
        }
        return $(uniq(r))
      }

    , parent: function() {
        return $(uniq(b(this).parent()))
      }

    , closest: function (selector) {
        return this.parents(selector, true)
      }

    , first: function () {
        return $(this.length ? this[0] : this)
      }

    , last: function () {
        return $(this.length ? this[this.length - 1] : [])
      }

    , next: function () {
        return $(b(this).next())
      }

    , previous: function () {
        return $(b(this).previous())
      }

    , related: function (t) {
        return $(b(this).related(t))
      }

    , appendTo: function (t) {
        return b(this.selector).appendTo(t, this)
      }

    , prependTo: function (t) {
        return b(this.selector).prependTo(t, this)
      }

    , insertAfter: function (t) {
        return b(this.selector).insertAfter(t, this)
      }

    , insertBefore: function (t) {
        return b(this.selector).insertBefore(t, this)
      }

    , clone: function () {
        return $(b(this).clone(this))
      }

    , siblings: function () {
        var i, l, p, r = []
        for (i = 0, l = this.length; i < l; i++) {
          p = this[i]
          while (p = p.previousSibling) p.nodeType == 1 && r.push(p)
          p = this[i]
          while (p = p.nextSibling) p.nodeType == 1 && r.push(p)
        }
        return $(r)
      }

    , children: function () {
        var i, l, el, r = []
        for (i = 0, l = this.length; i < l; i++) {
          if (!(el = b.firstChild(this[i]))) continue;
          r.push(el)
          while (el = el.nextSibling) el.nodeType == 1 && r.push(el)
        }
        return $(uniq(r))
      }

    , height: function (v) {
        return dimension.call(this, 'height', v)
      }

    , width: function (v) {
        return dimension.call(this, 'width', v)
      }
    }, true)

    /**
     * @param {string} type either width or height
     * @param {number=} opt_v becomes a setter instead of a getter
     * @return {number}
     */
    function dimension(type, opt_v) {
      return typeof opt_v == 'undefined'
        ? b(this).dim()[type]
        : this.css(type, opt_v)
    }
  }(ender));
}());

(function () {

  var module = { exports: {} }, exports = module.exports;

  /*!
    * Bean - copyright (c) Jacob Thornton 2011-2012
    * https://github.com/fat/bean
    * MIT license
    */
  (function (name, context, definition) {
    if (typeof module != 'undefined' && module.exports) module.exports = definition()
    else if (typeof define == 'function' && define.amd) define(definition)
    else context[name] = definition()
  })('bean', this, function (name, context) {
    name    = name    || 'bean'
    context = context || this

    var win            = window
      , old            = context[name]
      , namespaceRegex = /[^\.]*(?=\..*)\.|.*/
      , nameRegex      = /\..*/
      , addEvent       = 'addEventListener'
      , removeEvent    = 'removeEventListener'
      , doc            = document || {}
      , root           = doc.documentElement || {}
      , W3C_MODEL      = root[addEvent]
      , eventSupport   = W3C_MODEL ? addEvent : 'attachEvent'
      , ONE            = {} // singleton for quick matching making add() do one()

      , slice          = Array.prototype.slice
      , str2arr        = function (s, d) { return s.split(d || ' ') }
      , isString       = function (o) { return typeof o == 'string' }
      , isFunction     = function (o) { return typeof o == 'function' }

        // events that we consider to be 'native', anything not in this list will
        // be treated as a custom event
      , standardNativeEvents =
          'click dblclick mouseup mousedown contextmenu '                  + // mouse buttons
          'mousewheel mousemultiwheel DOMMouseScroll '                     + // mouse wheel
          'mouseover mouseout mousemove selectstart selectend '            + // mouse movement
          'keydown keypress keyup '                                        + // keyboard
          'orientationchange '                                             + // mobile
          'focus blur change reset select submit '                         + // form elements
          'load unload beforeunload resize move DOMContentLoaded '         + // window
          'readystatechange message '                                      + // window
          'error abort scroll '                                              // misc
        // element.fireEvent('onXYZ'... is not forgiving if we try to fire an event
        // that doesn't actually exist, so make sure we only do these on newer browsers
      , w3cNativeEvents =
          'show '                                                          + // mouse buttons
          'input invalid '                                                 + // form elements
          'touchstart touchmove touchend touchcancel '                     + // touch
          'gesturestart gesturechange gestureend '                         + // gesture
          'textinput'                                                      + // TextEvent
          'readystatechange pageshow pagehide popstate '                   + // window
          'hashchange offline online '                                     + // window
          'afterprint beforeprint '                                        + // printing
          'dragstart dragenter dragover dragleave drag drop dragend '      + // dnd
          'loadstart progress suspend emptied stalled loadmetadata '       + // media
          'loadeddata canplay canplaythrough playing waiting seeking '     + // media
          'seeked ended durationchange timeupdate play pause ratechange '  + // media
          'volumechange cuechange '                                        + // media
          'checking noupdate downloading cached updateready obsolete '       // appcache

        // convert to a hash for quick lookups
      , nativeEvents = (function (hash, events, i) {
          for (i = 0; i < events.length; i++) events[i] && (hash[events[i]] = 1)
          return hash
        }({}, str2arr(standardNativeEvents + (W3C_MODEL ? w3cNativeEvents : ''))))

        // custom events are events that we *fake*, they are not provided natively but
        // we can use native events to generate them
      , customEvents = (function () {
          var isAncestor = 'compareDocumentPosition' in root
                ? function (element, container) {
                    return container.compareDocumentPosition && (container.compareDocumentPosition(element) & 16) === 16
                  }
                : 'contains' in root
                  ? function (element, container) {
                      container = container.nodeType === 9 || container === window ? root : container
                      return container !== element && container.contains(element)
                    }
                  : function (element, container) {
                      while (element = element.parentNode) if (element === container) return 1
                      return 0
                    }
            , check = function (event) {
                var related = event.relatedTarget
                return !related
                  ? related == null
                  : (related !== this && related.prefix !== 'xul' && !/document/.test(this.toString())
                      && !isAncestor(related, this))
              }

          return {
              mouseenter: { base: 'mouseover', condition: check }
            , mouseleave: { base: 'mouseout', condition: check }
            , mousewheel: { base: /Firefox/.test(navigator.userAgent) ? 'DOMMouseScroll' : 'mousewheel' }
          }
        }())

        // we provide a consistent Event object across browsers by taking the actual DOM
        // event object and generating a new one from its properties.
      , Event = (function () {
              // a whitelist of properties (for different event types) tells us what to check for and copy
          var commonProps  = str2arr('altKey attrChange attrName bubbles cancelable ctrlKey currentTarget ' +
                'detail eventPhase getModifierState isTrusted metaKey relatedNode relatedTarget shiftKey '  +
                'srcElement target timeStamp type view which propertyName')
            , mouseProps   = commonProps.concat(str2arr('button buttons clientX clientY dataTransfer '      +
                'fromElement offsetX offsetY pageX pageY screenX screenY toElement'))
            , mouseWheelProps = mouseProps.concat(str2arr('wheelDelta wheelDeltaX wheelDeltaY wheelDeltaZ ' +
                'axis')) // 'axis' is FF specific
            , keyProps     = commonProps.concat(str2arr('char charCode key keyCode keyIdentifier '          +
                'keyLocation location'))
            , textProps    = commonProps.concat(str2arr('data'))
            , touchProps   = commonProps.concat(str2arr('touches targetTouches changedTouches scale rotation'))
            , messageProps = commonProps.concat(str2arr('data origin source'))
            , stateProps   = commonProps.concat(str2arr('state'))
            , overOutRegex = /over|out/
              // some event types need special handling and some need special properties, do that all here
            , typeFixers   = [
                  { // key events
                      reg: /key/i
                    , fix: function (event, newEvent) {
                        newEvent.keyCode = event.keyCode || event.which
                        return keyProps
                      }
                  }
                , { // mouse events
                      reg: /click|mouse(?!(.*wheel|scroll))|menu|drag|drop/i
                    , fix: function (event, newEvent, type) {
                        newEvent.rightClick = event.which === 3 || event.button === 2
                        newEvent.pos = { x: 0, y: 0 }
                        if (event.pageX || event.pageY) {
                          newEvent.clientX = event.pageX
                          newEvent.clientY = event.pageY
                        } else if (event.clientX || event.clientY) {
                          newEvent.clientX = event.clientX + doc.body.scrollLeft + root.scrollLeft
                          newEvent.clientY = event.clientY + doc.body.scrollTop + root.scrollTop
                        }
                        if (overOutRegex.test(type)) {
                          newEvent.relatedTarget = event.relatedTarget
                            || event[(type == 'mouseover' ? 'from' : 'to') + 'Element']
                        }
                        return mouseProps
                      }
                  }
                , { // mouse wheel events
                      reg: /mouse.*(wheel|scroll)/i
                    , fix: function () { return mouseWheelProps }
                  }
                , { // TextEvent
                      reg: /^text/i
                    , fix: function () { return textProps }
                  }
                , { // touch and gesture events
                      reg: /^touch|^gesture/i
                    , fix: function () { return touchProps }
                  }
                , { // message events
                      reg: /^message$/i
                    , fix: function () { return messageProps }
                  }
                , { // popstate events
                      reg: /^popstate$/i
                    , fix: function () { return stateProps }
                  }
                , { // everything else
                      reg: /.*/
                    , fix: function () { return commonProps }
                  }
              ]
            , typeFixerMap = {} // used to map event types to fixer functions (above), a basic cache mechanism

            , Event = function (event, element, isNative) {
                if (!arguments.length) return
                event = event || ((element.ownerDocument || element.document || element).parentWindow || win).event
                this.originalEvent = event
                this.isNative       = isNative
                this.isBean         = true

                if (!event) return

                var type   = event.type
                  , target = event.target || event.srcElement
                  , i, l, p, props, fixer

                this.target = target && target.nodeType === 3 ? target.parentNode : target

                if (isNative) { // we only need basic augmentation on custom events, the rest expensive & pointless
                  fixer = typeFixerMap[type]
                  if (!fixer) { // haven't encountered this event type before, map a fixer function for it
                    for (i = 0, l = typeFixers.length; i < l; i++) {
                      if (typeFixers[i].reg.test(type)) { // guaranteed to match at least one, last is .*
                        typeFixerMap[type] = fixer = typeFixers[i].fix
                        break
                      }
                    }
                  }

                  props = fixer(event, this, type)
                  for (i = props.length; i--;) {
                    if (!((p = props[i]) in this) && p in event) this[p] = event[p]
                  }
                }
              }

          // preventDefault() and stopPropagation() are a consistent interface to those functions
          // on the DOM, stop() is an alias for both of them together
          Event.prototype.preventDefault = function () {
            if (this.originalEvent.preventDefault) this.originalEvent.preventDefault()
            else this.originalEvent.returnValue = false
          }
          Event.prototype.stopPropagation = function () {
            if (this.originalEvent.stopPropagation) this.originalEvent.stopPropagation()
            else this.originalEvent.cancelBubble = true
          }
          Event.prototype.stop = function () {
            this.preventDefault()
            this.stopPropagation()
            this.stopped = true
          }
          // stopImmediatePropagation() has to be handled internally because we manage the event list for
          // each element
          // note that originalElement may be a Bean#Event object in some situations
          Event.prototype.stopImmediatePropagation = function () {
            if (this.originalEvent.stopImmediatePropagation) this.originalEvent.stopImmediatePropagation()
            this.isImmediatePropagationStopped = function () { return true }
          }
          Event.prototype.isImmediatePropagationStopped = function () {
            return this.originalEvent.isImmediatePropagationStopped && this.originalEvent.isImmediatePropagationStopped()
          }
          Event.prototype.clone = function (currentTarget) {
            //TODO: this is ripe for optimisation, new events are *expensive*
            // improving this will speed up delegated events
            var ne = new Event(this, this.element, this.isNative)
            ne.currentTarget = currentTarget
            return ne
          }

          return Event
        }())

        // if we're in old IE we can't do onpropertychange on doc or win so we use doc.documentElement for both
      , targetElement = function (element, isNative) {
          return !W3C_MODEL && !isNative && (element === doc || element === win) ? root : element
        }

        /**
          * Bean maintains an internal registry for event listeners. We don't touch elements, objects
          * or functions to identify them, instead we store everything in the registry.
          * Each event listener has a RegEntry object, we have one 'registry' for the whole instance.
          */
      , RegEntry = (function () {
          // each handler is wrapped so we can handle delegation and custom events
          var wrappedHandler = function (element, fn, condition, args) {
              var call = function (event, eargs) {
                    return fn.apply(element, args ? slice.call(eargs, event ? 0 : 1).concat(args) : eargs)
                  }
                , findTarget = function (event, eventElement) {
                    return fn.__beanDel ? fn.__beanDel.ft(event.target, element) : eventElement
                  }
                , handler = condition
                    ? function (event) {
                        var target = findTarget(event, this) // deleated event
                        if (condition.apply(target, arguments)) {
                          if (event) event.currentTarget = target
                          return call(event, arguments)
                        }
                      }
                    : function (event) {
                        if (fn.__beanDel) event = event.clone(findTarget(event)) // delegated event, fix the fix
                        return call(event, arguments)
                      }
              handler.__beanDel = fn.__beanDel
              return handler
            }

          , RegEntry = function (element, type, handler, original, namespaces, args, root) {
              var customType     = customEvents[type]
                , isNative

              if (type == 'unload') {
                // self clean-up
                handler = once(removeListener, element, type, handler, original)
              }

              if (customType) {
                if (customType.condition) {
                  handler = wrappedHandler(element, handler, customType.condition, args)
                }
                type = customType.base || type
              }

              this.isNative      = isNative = nativeEvents[type] && !!element[eventSupport]
              this.customType    = !W3C_MODEL && !isNative && type
              this.element       = element
              this.type          = type
              this.original      = original
              this.namespaces    = namespaces
              this.eventType     = W3C_MODEL || isNative ? type : 'propertychange'
              this.target        = targetElement(element, isNative)
              this[eventSupport] = !!this.target[eventSupport]
              this.root          = root
              this.handler       = wrappedHandler(element, handler, null, args)
            }

          // given a list of namespaces, is our entry in any of them?
          RegEntry.prototype.inNamespaces = function (checkNamespaces) {
            var i, j, c = 0
            if (!checkNamespaces) return true
            if (!this.namespaces) return false
            for (i = checkNamespaces.length; i--;) {
              for (j = this.namespaces.length; j--;) {
                if (checkNamespaces[i] == this.namespaces[j]) c++
              }
            }
            return checkNamespaces.length === c
          }

          // match by element, original fn (opt), handler fn (opt)
          RegEntry.prototype.matches = function (checkElement, checkOriginal, checkHandler) {
            return this.element === checkElement &&
              (!checkOriginal || this.original === checkOriginal) &&
              (!checkHandler || this.handler === checkHandler)
          }

          return RegEntry
        }())

      , registry = (function () {
          // our map stores arrays by event type, just because it's better than storing
          // everything in a single array.
          // uses '$' as a prefix for the keys for safety and 'r' as a special prefix for
          // rootListeners so we can look them up fast
          var map = {}

            // generic functional search of our registry for matching listeners,
            // `fn` returns false to break out of the loop
            , forAll = function (element, type, original, handler, root, fn) {
                var pfx = root ? 'r' : '$'
                if (!type || type == '*') {
                  // search the whole registry
                  for (var t in map) {
                    if (t.charAt(0) == pfx) {
                      forAll(element, t.substr(1), original, handler, root, fn)
                    }
                  }
                } else {
                  var i = 0, l, list = map[pfx + type], all = element == '*'
                  if (!list) return
                  for (l = list.length; i < l; i++) {
                    if ((all || list[i].matches(element, original, handler)) && !fn(list[i], list, i, type)) return
                  }
                }
              }

            , has = function (element, type, original, root) {
                // we're not using forAll here simply because it's a bit slower and this
                // needs to be fast
                var i, list = map[(root ? 'r' : '$') + type]
                if (list) {
                  for (i = list.length; i--;) {
                    if (!list[i].root && list[i].matches(element, original, null)) return true
                  }
                }
                return false
              }

            , get = function (element, type, original, root) {
                var entries = []
                forAll(element, type, original, null, root, function (entry) {
                  return entries.push(entry)
                })
                return entries
              }

            , put = function (entry) {
                var has = !entry.root && !this.has(entry.element, entry.type, null, false)
                  , key = (entry.root ? 'r' : '$') + entry.type
                ;(map[key] || (map[key] = [])).push(entry)
                return has
              }

            , del = function (entry) {
                forAll(entry.element, entry.type, null, entry.handler, entry.root, function (entry, list, i) {
                  list.splice(i, 1)
                  entry.removed = true
                  if (list.length === 0) delete map[(entry.root ? 'r' : '$') + entry.type]
                  return false
                })
              }

              // dump all entries, used for onunload
            , entries = function () {
                var t, entries = []
                for (t in map) {
                  if (t.charAt(0) == '$') entries = entries.concat(map[t])
                }
                return entries
              }

          return { has: has, get: get, put: put, del: del, entries: entries }
        }())

        // we need a selector engine for delegated events, use querySelectorAll if it exists
        // but for older browsers we need Qwery, Sizzle or similar
      , selectorEngine
      , setSelectorEngine = function (e) {
          if (!arguments.length) {
            selectorEngine = doc.querySelectorAll
              ? function (s, r) {
                  return r.querySelectorAll(s)
                }
              : function () {
                  throw new Error('Bean: No selector engine installed') // eeek
                }
          } else {
            selectorEngine = e
          }
        }

        // we attach this listener to each DOM event that we need to listen to, only once
        // per event type per DOM element
      , rootListener = function (event, type) {
          if (!W3C_MODEL && type && event && event.propertyName != '_on' + type) return

          var listeners = registry.get(this, type || event.type, null, false)
            , l = listeners.length
            , i = 0

          event = new Event(event, this, true)
          if (type) event.type = type

          // iterate through all handlers registered for this type, calling them unless they have
          // been removed by a previous handler or stopImmediatePropagation() has been called
          for (; i < l && !event.isImmediatePropagationStopped(); i++) {
            if (!listeners[i].removed) listeners[i].handler.call(this, event)
          }
        }

        // add and remove listeners to DOM elements
      , listener = W3C_MODEL
          ? function (element, type, add) {
              // new browsers
              element[add ? addEvent : removeEvent](type, rootListener, false)
            }
          : function (element, type, add, custom) {
              // IE8 and below, use attachEvent/detachEvent and we have to piggy-back propertychange events
              // to simulate event bubbling etc.
              var entry
              if (add) {
                registry.put(entry = new RegEntry(
                    element
                  , custom || type
                  , function (event) { // handler
                      rootListener.call(element, event, custom)
                    }
                  , rootListener
                  , null
                  , null
                  , true // is root
                ))
                if (custom && element['_on' + custom] == null) element['_on' + custom] = 0
                entry.target.attachEvent('on' + entry.eventType, entry.handler)
              } else {
                entry = registry.get(element, custom || type, rootListener, true)[0]
                if (entry) {
                  entry.target.detachEvent('on' + entry.eventType, entry.handler)
                  registry.del(entry)
                }
              }
            }

      , once = function (rm, element, type, fn, originalFn) {
          // wrap the handler in a handler that does a remove as well
          return function () {
            fn.apply(this, arguments)
            rm(element, type, originalFn)
          }
        }

      , removeListener = function (element, orgType, handler, namespaces) {
          var type     = orgType && orgType.replace(nameRegex, '')
            , handlers = registry.get(element, type, null, false)
            , removed  = {}
            , i, l

          for (i = 0, l = handlers.length; i < l; i++) {
            if ((!handler || handlers[i].original === handler) && handlers[i].inNamespaces(namespaces)) {
              // TODO: this is problematic, we have a registry.get() and registry.del() that
              // both do registry searches so we waste cycles doing this. Needs to be rolled into
              // a single registry.forAll(fn) that removes while finding, but the catch is that
              // we'll be splicing the arrays that we're iterating over. Needs extra tests to
              // make sure we don't screw it up. @rvagg
              registry.del(handlers[i])
              if (!removed[handlers[i].eventType] && handlers[i][eventSupport])
                removed[handlers[i].eventType] = { t: handlers[i].eventType, c: handlers[i].type }
            }
          }
          // check each type/element for removed listeners and remove the rootListener where it's no longer needed
          for (i in removed) {
            if (!registry.has(element, removed[i].t, null, false)) {
              // last listener of this type, remove the rootListener
              listener(element, removed[i].t, false, removed[i].c)
            }
          }
        }

        // set up a delegate helper using the given selector, wrap the handler function
      , delegate = function (selector, fn) {
          //TODO: findTarget (therefore $) is called twice, once for match and once for
          // setting e.currentTarget, fix this so it's only needed once
          var findTarget = function (target, root) {
                var i, array = isString(selector) ? selectorEngine(selector, root) : selector
                for (; target && target !== root; target = target.parentNode) {
                  for (i = array.length; i--;) {
                    if (array[i] === target) return target
                  }
                }
              }
            , handler = function (e) {
                var match = findTarget(e.target, this)
                if (match) fn.apply(match, arguments)
              }

          // __beanDel isn't pleasant but it's a private function, not exposed outside of Bean
          handler.__beanDel = {
              ft       : findTarget // attach it here for customEvents to use too
            , selector : selector
          }
          return handler
        }

      , fireListener = W3C_MODEL ? function (isNative, type, element) {
          // modern browsers, do a proper dispatchEvent()
          var evt = doc.createEvent(isNative ? 'HTMLEvents' : 'UIEvents')
          evt[isNative ? 'initEvent' : 'initUIEvent'](type, true, true, win, 1)
          element.dispatchEvent(evt)
        } : function (isNative, type, element) {
          // old browser use onpropertychange, just increment a custom property to trigger the event
          element = targetElement(element, isNative)
          isNative ? element.fireEvent('on' + type, doc.createEventObject()) : element['_on' + type]++
        }

        /**
          * Public API: off(), on(), add(), (remove()), one(), fire(), clone()
          */

        /**
          * off(element[, eventType(s)[, handler ]])
          */
      , off = function (element, typeSpec, fn) {
          var isTypeStr = isString(typeSpec)
            , k, type, namespaces, i

          if (isTypeStr && typeSpec.indexOf(' ') > 0) {
            // off(el, 't1 t2 t3', fn) or off(el, 't1 t2 t3')
            typeSpec = str2arr(typeSpec)
            for (i = typeSpec.length; i--;)
              off(element, typeSpec[i], fn)
            return element
          }

          type = isTypeStr && typeSpec.replace(nameRegex, '')
          if (type && customEvents[type]) type = customEvents[type].base

          if (!typeSpec || isTypeStr) {
            // off(el) or off(el, t1.ns) or off(el, .ns) or off(el, .ns1.ns2.ns3)
            if (namespaces = isTypeStr && typeSpec.replace(namespaceRegex, '')) namespaces = str2arr(namespaces, '.')
            removeListener(element, type, fn, namespaces)
          } else if (isFunction(typeSpec)) {
            // off(el, fn)
            removeListener(element, null, typeSpec)
          } else {
            // off(el, { t1: fn1, t2, fn2 })
            for (k in typeSpec) {
              if (typeSpec.hasOwnProperty(k)) off(element, k, typeSpec[k])
            }
          }

          return element
        }

        /**
          * on(element, eventType(s)[, selector], handler[, args ])
          */
      , on = function(element, events, selector, fn) {
          var originalFn, type, types, i, args, entry, first

          //TODO: the undefined check means you can't pass an 'args' argument, fix this perhaps?
          if (selector === undefined && typeof events == 'object') {
            //TODO: this can't handle delegated events
            for (type in events) {
              if (events.hasOwnProperty(type)) {
                on.call(this, element, type, events[type])
              }
            }
            return
          }

          if (!isFunction(selector)) {
            // delegated event
            originalFn = fn
            args       = slice.call(arguments, 4)
            fn         = delegate(selector, originalFn, selectorEngine)
          } else {
            args       = slice.call(arguments, 3)
            fn         = originalFn = selector
          }

          types = str2arr(events)

          // special case for one(), wrap in a self-removing handler
          if (this === ONE) {
            fn = once(off, element, events, fn, originalFn)
          }

          for (i = types.length; i--;) {
            // add new handler to the registry and check if it's the first for this element/type
            first = registry.put(entry = new RegEntry(
                element
              , types[i].replace(nameRegex, '') // event type
              , fn
              , originalFn
              , str2arr(types[i].replace(namespaceRegex, ''), '.') // namespaces
              , args
              , false // not root
            ))
            if (entry[eventSupport] && first) {
              // first event of this type on this element, add root listener
              listener(element, entry.eventType, true, entry.customType)
            }
          }

          return element
        }

        /**
          * add(element[, selector], eventType(s), handler[, args ])
          *
          * Deprecated: kept (for now) for backward-compatibility
          */
      , add = function (element, events, fn, delfn) {
          return on.apply(
              null
            , !isString(fn)
                ? slice.call(arguments)
                : [ element, fn, events, delfn ].concat(arguments.length > 3 ? slice.call(arguments, 5) : [])
          )
        }

        /**
          * one(element, eventType(s)[, selector], handler[, args ])
          */
      , one = function () {
          return on.apply(ONE, arguments)
        }

        /**
          * fire(element, eventType(s)[, args ])
          *
          * The optional 'args' argument must be an array, if no 'args' argument is provided
          * then we can use the browser's DOM event system, otherwise we trigger handlers manually
          */
      , fire = function (element, type, args) {
          var types = str2arr(type)
            , i, j, l, names, handlers

          for (i = types.length; i--;) {
            type = types[i].replace(nameRegex, '')
            if (names = types[i].replace(namespaceRegex, '')) names = str2arr(names, '.')
            if (!names && !args && element[eventSupport]) {
              fireListener(nativeEvents[type], type, element)
            } else {
              // non-native event, either because of a namespace, arguments or a non DOM element
              // iterate over all listeners and manually 'fire'
              handlers = registry.get(element, type, null, false)
              args = [false].concat(args)
              for (j = 0, l = handlers.length; j < l; j++) {
                if (handlers[j].inNamespaces(names)) {
                  handlers[j].handler.apply(element, args)
                }
              }
            }
          }
          return element
        }

        /**
          * clone(dstElement, srcElement[, eventType ])
          *
          * TODO: perhaps for consistency we should allow the same flexibility in type specifiers?
          */
      , clone = function (element, from, type) {
          var handlers = registry.get(from, type, null, false)
            , l = handlers.length
            , i = 0
            , args, beanDel

          for (; i < l; i++) {
            if (handlers[i].original) {
              args = [ element, handlers[i].type ]
              if (beanDel = handlers[i].handler.__beanDel) args.push(beanDel.selector)
              args.push(handlers[i].original)
              on.apply(null, args)
            }
          }
          return element
        }

      , bean = {
            on                : on
          , add               : add
          , one               : one
          , off               : off
          , remove            : off
          , clone             : clone
          , fire              : fire
          , setSelectorEngine : setSelectorEngine
          , noConflict        : function () {
              context[name] = old
              return this
            }
        }

    // for IE, clean up on unload to avoid leaks
    if (win.attachEvent) {
      var cleanup = function () {
        var i, entries = registry.entries()
        for (i in entries) {
          if (entries[i].type && entries[i].type !== 'unload') off(entries[i].element, entries[i].type)
        }
        win.detachEvent('onunload', cleanup)
        win.CollectGarbage && win.CollectGarbage()
      }
      win.attachEvent('onunload', cleanup)
    }

    // initialize selector engine to internal default (qSA or throw Error)
    setSelectorEngine()

    return bean
  });
  if (typeof provide == "function") provide("bean", module.exports);

  !function ($) {
    var b = require('bean')

      , integrate = function (method, type, method2) {
          var _args = type ? [type] : []
          return function () {
            for (var i = 0, l = this.length; i < l; i++) {
              if (!arguments.length && method == 'on' && type) method = 'fire'
              b[method].apply(this, [this[i]].concat(_args, Array.prototype.slice.call(arguments, 0)))
            }
            return this
          }
        }

      , add   = integrate('add')
      , on    = integrate('on')
      , one   = integrate('one')
      , off   = integrate('off')
      , fire  = integrate('fire')
      , clone = integrate('clone')

      , hover = function (enter, leave, i) { // i for internal
          for (i = this.length; i--;) {
            b.on.call(this, this[i], 'mouseenter', enter)
            b.on.call(this, this[i], 'mouseleave', leave)
          }
          return this
        }

      , methods = {
            on             : on
          , addListener    : on
          , bind           : on
          , listen         : on
          , delegate       : add // jQuery compat, same arg order as add()

          , one            : one

          , off            : off
          , unbind         : off
          , unlisten       : off
          , removeListener : off
          , undelegate     : off

          , emit           : fire
          , trigger        : fire

          , cloneEvents    : clone

          , hover          : hover
        }

      , shortcuts =
           ('blur change click dblclick error focus focusin focusout keydown keypress '
          + 'keyup load mousedown mouseenter mouseleave mouseout mouseover mouseup '
          + 'mousemove resize scroll select submit unload').split(' ')

    for (var i = shortcuts.length; i--;) {
      methods[shortcuts[i]] = integrate('on', shortcuts[i])
    }

    b.setSelectorEngine($)

    $.ender(methods, true)
  }(ender);
}());