/*!
  * =============================================================
  * Ender: open module JavaScript framework (https://ender.no.de)
  * Build: ender build zepto iscroll
  * Packages: ender-js@0.4.4-1 zepto@0.0.3 iscroll@4.2.5
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

  /* Zepto v1.0rc1 - polyfill zepto event detect fx ajax form touch - zeptojs.com/license */
  (function(a){String.prototype.trim===a&&(String.prototype.trim=function(){return this.replace(/^\s+/,"").replace(/\s+$/,"")}),Array.prototype.reduce===a&&(Array.prototype.reduce=function(b){if(this===void 0||this===null)throw new TypeError;var c=Object(this),d=c.length>>>0,e=0,f;if(typeof b!="function")throw new TypeError;if(d==0&&arguments.length==1)throw new TypeError;if(arguments.length>=2)f=arguments[1];else do{if(e in c){f=c[e++];break}if(++e>=d)throw new TypeError}while(!0);while(e<d)e in c&&(f=b.call(a,f,c[e],e,c)),e++;return f})})();var Zepto=function(){function A(a){return v.call(a)=="[object Function]"}function B(a){return a instanceof Object}function C(b){var c,d;if(v.call(b)!=="[object Object]")return!1;d=A(b.constructor)&&b.constructor.prototype;if(!d||!hasOwnProperty.call(d,"isPrototypeOf"))return!1;for(c in b);return c===a||hasOwnProperty.call(b,c)}function D(a){return a instanceof Array}function E(a){return typeof a.length=="number"}function F(b){return b.filter(function(b){return b!==a&&b!==null})}function G(a){return a.length>0?[].concat.apply([],a):a}function H(a){return a.replace(/::/g,"/").replace(/([A-Z]+)([A-Z][a-z])/g,"$1_$2").replace(/([a-z\d])([A-Z])/g,"$1_$2").replace(/_/g,"-").toLowerCase()}function I(a){return a in i?i[a]:i[a]=new RegExp("(^|\\s)"+a+"(\\s|$)")}function J(a,b){return typeof b=="number"&&!k[H(a)]?b+"px":b}function K(a){var b,c;return h[a]||(b=g.createElement(a),g.body.appendChild(b),c=j(b,"").getPropertyValue("display"),b.parentNode.removeChild(b),c=="none"&&(c="block"),h[a]=c),h[a]}function L(b,d){return d===a?c(b):c(b).filter(d)}function M(a,b,c,d){return A(b)?b.call(a,c,d):b}function N(a,b,d){var e=a%2?b:b.parentNode;e?e.insertBefore(d,a?a==1?e.firstChild:a==2?b:null:b.nextSibling):c(d).remove()}function O(a,b){b(a);for(var c in a.childNodes)O(a.childNodes[c],b)}var a,b,c,d,e=[],f=e.slice,g=window.document,h={},i={},j=g.defaultView.getComputedStyle,k={"column-count":1,columns:1,"font-weight":1,"line-height":1,opacity:1,"z-index":1,zoom:1},l=/^\s*<(\w+|!)[^>]*>/,m=[1,3,8,9,11],n=["after","prepend","before","append"],o=g.createElement("table"),p=g.createElement("tr"),q={tr:g.createElement("tbody"),tbody:o,thead:o,tfoot:o,td:p,th:p,"*":g.createElement("div")},r=/complete|loaded|interactive/,s=/^\.([\w-]+)$/,t=/^#([\w-]+)$/,u=/^[\w-]+$/,v={}.toString,w={},x,y,z=g.createElement("div");return w.matches=function(a,b){if(!a||a.nodeType!==1)return!1;var c=a.webkitMatchesSelector||a.mozMatchesSelector||a.oMatchesSelector||a.matchesSelector;if(c)return c.call(a,b);var d,e=a.parentNode,f=!e;return f&&(e=z).appendChild(a),d=~w.qsa(e,b).indexOf(a),f&&z.removeChild(a),d},x=function(a){return a.replace(/-+(.)?/g,function(a,b){return b?b.toUpperCase():""})},y=function(a){return a.filter(function(b,c){return a.indexOf(b)==c})},w.fragment=function(b,d){d===a&&(d=l.test(b)&&RegExp.$1),d in q||(d="*");var e=q[d];return e.innerHTML=""+b,c.each(f.call(e.childNodes),function(){e.removeChild(this)})},w.Z=function(a,b){return a=a||[],a.__proto__=arguments.callee.prototype,a.selector=b||"",a},w.isZ=function(a){return a instanceof w.Z},w.init=function(b,d){if(!b)return w.Z();if(A(b))return c(g).ready(b);if(w.isZ(b))return b;var e;if(D(b))e=F(b);else if(C(b))e=[c.extend({},b)],b=null;else if(m.indexOf(b.nodeType)>=0||b===window)e=[b],b=null;else if(l.test(b))e=w.fragment(b.trim(),RegExp.$1),b=null;else{if(d!==a)return c(d).find(b);e=w.qsa(g,b)}return w.Z(e,b)},c=function(a,b){return w.init(a,b)},c.extend=function(c){return f.call(arguments,1).forEach(function(d){for(b in d)d[b]!==a&&(c[b]=d[b])}),c},w.qsa=function(a,b){var c;return a===g&&t.test(b)?(c=a.getElementById(RegExp.$1))?[c]:e:a.nodeType!==1&&a.nodeType!==9?e:f.call(s.test(b)?a.getElementsByClassName(RegExp.$1):u.test(b)?a.getElementsByTagName(b):a.querySelectorAll(b))},c.isFunction=A,c.isObject=B,c.isArray=D,c.isPlainObject=C,c.inArray=function(a,b,c){return e.indexOf.call(b,a,c)},c.trim=function(a){return a.trim()},c.uuid=0,c.map=function(a,b){var c,d=[],e,f;if(E(a))for(e=0;e<a.length;e++)c=b(a[e],e),c!=null&&d.push(c);else for(f in a)c=b(a[f],f),c!=null&&d.push(c);return G(d)},c.each=function(a,b){var c,d;if(E(a)){for(c=0;c<a.length;c++)if(b.call(a[c],c,a[c])===!1)return a}else for(d in a)if(b.call(a[d],d,a[d])===!1)return a;return a},c.fn={forEach:e.forEach,reduce:e.reduce,push:e.push,indexOf:e.indexOf,concat:e.concat,map:function(a){return c.map(this,function(b,c){return a.call(b,c,b)})},slice:function(){return c(f.apply(this,arguments))},ready:function(a){return r.test(g.readyState)?a(c):g.addEventListener("DOMContentLoaded",function(){a(c)},!1),this},get:function(b){return b===a?f.call(this):this[b]},toArray:function(){return this.get()},size:function(){return this.length},remove:function(){return this.each(function(){this.parentNode!=null&&this.parentNode.removeChild(this)})},each:function(a){return this.forEach(function(b,c){a.call(b,c,b)}),this},filter:function(a){return c([].filter.call(this,function(b){return w.matches(b,a)}))},add:function(a,b){return c(y(this.concat(c(a,b))))},is:function(a){return this.length>0&&w.matches(this[0],a)},not:function(b){var d=[];if(A(b)&&b.call!==a)this.each(function(a){b.call(this,a)||d.push(this)});else{var e=typeof b=="string"?this.filter(b):E(b)&&A(b.item)?f.call(b):c(b);this.forEach(function(a){e.indexOf(a)<0&&d.push(a)})}return c(d)},eq:function(a){return a===-1?this.slice(a):this.slice(a,+a+1)},first:function(){var a=this[0];return a&&!B(a)?a:c(a)},last:function(){var a=this[this.length-1];return a&&!B(a)?a:c(a)},find:function(a){var b;return this.length==1?b=w.qsa(this[0],a):b=this.map(function(){return w.qsa(this,a)}),c(b)},closest:function(a,b){var d=this[0];while(d&&!w.matches(d,a))d=d!==b&&d!==g&&d.parentNode;return c(d)},parents:function(a){var b=[],d=this;while(d.length>0)d=c.map(d,function(a){if((a=a.parentNode)&&a!==g&&b.indexOf(a)<0)return b.push(a),a});return L(b,a)},parent:function(a){return L(y(this.pluck("parentNode")),a)},children:function(a){return L(this.map(function(){return f.call(this.children)}),a)},siblings:function(a){return L(this.map(function(a,b){return f.call(b.parentNode.children).filter(function(a){return a!==b})}),a)},empty:function(){return this.each(function(){this.innerHTML=""})},pluck:function(a){return this.map(function(){return this[a]})},show:function(){return this.each(function(){this.style.display=="none"&&(this.style.display=null),j(this,"").getPropertyValue("display")=="none"&&(this.style.display=K(this.nodeName))})},replaceWith:function(a){return this.before(a).remove()},wrap:function(a){return this.each(function(){c(this).wrapAll(c(a)[0].cloneNode(!1))})},wrapAll:function(a){return this[0]&&(c(this[0]).before(a=c(a)),a.append(this)),this},unwrap:function(){return this.parent().each(function(){c(this).replaceWith(c(this).children())}),this},clone:function(){return c(this.map(function(){return this.cloneNode(!0)}))},hide:function(){return this.css("display","none")},toggle:function(b){return(b===a?this.css("display")=="none":b)?this.show():this.hide()},prev:function(){return c(this.pluck("previousElementSibling"))},next:function(){return c(this.pluck("nextElementSibling"))},html:function(b){return b===a?this.length>0?this[0].innerHTML:null:this.each(function(a){var d=this.innerHTML;c(this).empty().append(M(this,b,a,d))})},text:function(b){return b===a?this.length>0?this[0].textContent:null:this.each(function(){this.textContent=b})},attr:function(c,d){var e;return typeof c=="string"&&d===a?this.length==0||this[0].nodeType!==1?a:c=="value"&&this[0].nodeName=="INPUT"?this.val():!(e=this[0].getAttribute(c))&&c in this[0]?this[0][c]:e:this.each(function(a){if(this.nodeType!==1)return;if(B(c))for(b in c)this.setAttribute(b,c[b]);else this.setAttribute(c,M(this,d,a,this.getAttribute(c)))})},removeAttr:function(a){return this.each(function(){this.nodeType===1&&this.removeAttribute(a)})},prop:function(b,c){return c===a?this[0]?this[0][b]:a:this.each(function(a){this[b]=M(this,c,a,this[b])})},data:function(b,c){var d=this.attr("data-"+H(b),c);return d!==null?d:a},val:function(b){return b===a?this.length>0?this[0].value:a:this.each(function(a){this.value=M(this,b,a,this.value)})},offset:function(){if(this.length==0)return null;var a=this[0].getBoundingClientRect();return{left:a.left+window.pageXOffset,top:a.top+window.pageYOffset,width:a.width,height:a.height}},css:function(c,d){if(d===a&&typeof c=="string")return this.length==0?a:this[0].style[x(c)]||j(this[0],"").getPropertyValue(c);var e="";for(b in c)typeof c[b]=="string"&&c[b]==""?this.each(function(){this.style.removeProperty(H(b))}):e+=H(b)+":"+J(b,c[b])+";";return typeof c=="string"&&(d==""?this.each(function(){this.style.removeProperty(H(c))}):e=H(c)+":"+J(c,d)),this.each(function(){this.style.cssText+=";"+e})},index:function(a){return a?this.indexOf(c(a)[0]):this.parent().children().indexOf(this[0])},hasClass:function(a){return this.length<1?!1:I(a).test(this[0].className)},addClass:function(a){return this.each(function(b){d=[];var e=this.className,f=M(this,a,b,e);f.split(/\s+/g).forEach(function(a){c(this).hasClass(a)||d.push(a)},this),d.length&&(this.className+=(e?" ":"")+d.join(" "))})},removeClass:function(b){return this.each(function(c){if(b===a)return this.className="";d=this.className,M(this,b,c,d).split(/\s+/g).forEach(function(a){d=d.replace(I(a)," ")}),this.className=d.trim()})},toggleClass:function(b,d){return this.each(function(e){var f=M(this,b,e,this.className);(d===a?!c(this).hasClass(f):d)?c(this).addClass(f):c(this).removeClass(f)})}},["width","height"].forEach(function(b){c.fn[b]=function(d){var e,f=b.replace(/./,function(a){return a[0].toUpperCase()});return d===a?this[0]==window?window["inner"+f]:this[0]==g?g.documentElement["offset"+f]:(e=this.offset())&&e[b]:this.each(function(a){var e=c(this);e.css(b,M(this,d,a,e[b]()))})}}),n.forEach(function(a,b){c.fn[a]=function(){var a=c.map(arguments,function(a){return B(a)?a:w.fragment(a)});if(a.length<1)return this;var d=this.length,e=d>1,f=b<2;return this.each(function(c,g){for(var h=0;h<a.length;h++){var i=a[f?a.length-h-1:h];O(i,function(a){a.nodeName!=null&&a.nodeName.toUpperCase()==="SCRIPT"&&(!a.type||a.type==="text/javascript")&&window.eval.call(window,a.innerHTML)}),e&&c<d-1&&(i=i.cloneNode(!0)),N(b,g,i)}})},c.fn[b%2?a+"To":"insert"+(b?"Before":"After")]=function(b){return c(b)[a](this),this}}),w.Z.prototype=c.fn,w.camelize=x,w.uniq=y,c.zepto=w,c}();window.Zepto=Zepto,"$"in window||(window.$=Zepto),function(a){function f(a){return a._zid||(a._zid=d++)}function g(a,b,d,e){b=h(b);if(b.ns)var g=i(b.ns);return(c[f(a)]||[]).filter(function(a){return a&&(!b.e||a.e==b.e)&&(!b.ns||g.test(a.ns))&&(!d||f(a.fn)===f(d))&&(!e||a.sel==e)})}function h(a){var b=(""+a).split(".");return{e:b[0],ns:b.slice(1).sort().join(" ")}}function i(a){return new RegExp("(?:^| )"+a.replace(" "," .* ?")+"(?: |$)")}function j(b,c,d){a.isObject(b)?a.each(b,d):b.split(/\s/).forEach(function(a){d(a,c)})}function k(b,d,e,g,i,k){k=!!k;var l=f(b),m=c[l]||(c[l]=[]);j(d,e,function(c,d){var e=i&&i(d,c),f=e||d,j=function(a){var c=f.apply(b,[a].concat(a.data));return c===!1&&a.preventDefault(),c},l=a.extend(h(c),{fn:d,proxy:j,sel:g,del:e,i:m.length});m.push(l),b.addEventListener(l.e,j,k)})}function l(a,b,d,e){var h=f(a);j(b||"",d,function(b,d){g(a,b,d,e).forEach(function(b){delete c[h][b.i],a.removeEventListener(b.e,b.proxy,!1)})})}function p(b){var c=a.extend({originalEvent:b},b);return a.each(o,function(a,d){c[a]=function(){return this[d]=m,b[a].apply(b,arguments)},c[d]=n}),c}function q(a){if(!("defaultPrevented"in a)){a.defaultPrevented=!1;var b=a.preventDefault;a.preventDefault=function(){this.defaultPrevented=!0,b.call(this)}}}var b=a.zepto.qsa,c={},d=1,e={};e.click=e.mousedown=e.mouseup=e.mousemove="MouseEvents",a.event={add:k,remove:l},a.proxy=function(b,c){if(a.isFunction(b)){var d=function(){return b.apply(c,arguments)};return d._zid=f(b),d}if(typeof c=="string")return a.proxy(b[c],b);throw new TypeError("expected function")},a.fn.bind=function(a,b){return this.each(function(){k(this,a,b)})},a.fn.unbind=function(a,b){return this.each(function(){l(this,a,b)})},a.fn.one=function(a,b){return this.each(function(c,d){k(this,a,b,null,function(a,b){return function(){var c=a.apply(d,arguments);return l(d,b,a),c}})})};var m=function(){return!0},n=function(){return!1},o={preventDefault:"isDefaultPrevented",stopImmediatePropagation:"isImmediatePropagationStopped",stopPropagation:"isPropagationStopped"};a.fn.delegate=function(b,c,d){var e=!1;if(c=="blur"||c=="focus")a.iswebkit?c=c=="blur"?"focusout":c=="focus"?"focusin":c:e=!0;return this.each(function(f,g){k(g,c,d,b,function(c){return function(d){var e,f=a(d.target).closest(b,g).get(0);if(f)return e=a.extend(p(d),{currentTarget:f,liveFired:g}),c.apply(f,[e].concat([].slice.call(arguments,1)))}},e)})},a.fn.undelegate=function(a,b,c){return this.each(function(){l(this,b,c,a)})},a.fn.live=function(b,c){return a(document.body).delegate(this.selector,b,c),this},a.fn.die=function(b,c){return a(document.body).undelegate(this.selector,b,c),this},a.fn.on=function(b,c,d){return c==undefined||a.isFunction(c)?this.bind(b,c):this.delegate(c,b,d)},a.fn.off=function(b,c,d){return c==undefined||a.isFunction(c)?this.unbind(b,c):this.undelegate(c,b,d)},a.fn.trigger=function(b,c){return typeof b=="string"&&(b=a.Event(b)),q(b),b.data=c,this.each(function(){"dispatchEvent"in this&&this.dispatchEvent(b)})},a.fn.triggerHandler=function(b,c){var d,e;return this.each(function(f,h){d=p(typeof b=="string"?a.Event(b):b),d.data=c,d.target=h,a.each(g(h,b.type||b),function(a,b){e=b.proxy(d);if(d.isImmediatePropagationStopped())return!1})}),e},"focusin focusout load resize scroll unload click dblclick mousedown mouseup mousemove mouseover mouseout change select keydown keypress keyup error".split(" ").forEach(function(b){a.fn[b]=function(a){return this.bind(b,a)}}),["focus","blur"].forEach(function(b){a.fn[b]=function(a){if(a)this.bind(b,a);else if(this.length)try{this.get(0)[b]()}catch(c){}return this}}),a.Event=function(a,b){var c=document.createEvent(e[a]||"Events"),d=!0;if(b)for(var f in b)f=="bubbles"?d=!!b[f]:c[f]=b[f];return c.initEvent(a,d,!0,null,null,null,null,null,null,null,null,null,null,null,null),c}}(Zepto),function(a){function b(a){var b=this.os={},c=this.browser={},d=a.match(/WebKit\/([\d.]+)/),e=a.match(/(Android)\s+([\d.]+)/),f=a.match(/(iPad).*OS\s([\d_]+)/),g=!f&&a.match(/(iPhone\sOS)\s([\d_]+)/),h=a.match(/(webOS|hpwOS)[\s\/]([\d.]+)/),i=h&&a.match(/TouchPad/),j=a.match(/Kindle\/([\d.]+)/),k=a.match(/Silk\/([\d._]+)/),l=a.match(/(BlackBerry).*Version\/([\d.]+)/);if(c.webkit=!!d)c.version=d[1];e&&(b.android=!0,b.version=e[2]),g&&(b.ios=b.iphone=!0,b.version=g[2].replace(/_/g,".")),f&&(b.ios=b.ipad=!0,b.version=f[2].replace(/_/g,".")),h&&(b.webos=!0,b.version=h[2]),i&&(b.touchpad=!0),l&&(b.blackberry=!0,b.version=l[2]),j&&(b.kindle=!0,b.version=j[1]),k&&(c.silk=!0,c.version=k[1]),!k&&b.android&&a.match(/Kindle Fire/)&&(c.silk=!0)}b.call(a,navigator.userAgent),a.__detect=b}(Zepto),function(a,b){function l(a){return a.toLowerCase()}function m(a){return d?d+a:l(a)}var c="",d,e,f,g={Webkit:"webkit",Moz:"",O:"o",ms:"MS"},h=window.document,i=h.createElement("div"),j=/^((translate|rotate|scale)(X|Y|Z|3d)?|matrix(3d)?|perspective|skew(X|Y)?)$/i,k={};a.each(g,function(a,e){if(i.style[a+"TransitionProperty"]!==b)return c="-"+l(a)+"-",d=e,!1}),k[c+"transition-property"]=k[c+"transition-duration"]=k[c+"transition-timing-function"]=k[c+"animation-name"]=k[c+"animation-duration"]="",a.fx={off:d===b&&i.style.transitionProperty===b,cssPrefix:c,transitionEnd:m("TransitionEnd"),animationEnd:m("AnimationEnd")},a.fn.animate=function(b,c,d,e){return a.isObject(c)&&(d=c.easing,e=c.complete,c=c.duration),c&&(c/=1e3),this.anim(b,c,d,e)},a.fn.anim=function(d,e,f,g){var h,i={},l,m=this,n,o=a.fx.transitionEnd;e===b&&(e=.4),a.fx.off&&(e=0);if(typeof d=="string")i[c+"animation-name"]=d,i[c+"animation-duration"]=e+"s",o=a.fx.animationEnd;else{for(l in d)j.test(l)?(h||(h=[]),h.push(l+"("+d[l]+")")):i[l]=d[l];h&&(i[c+"transform"]=h.join(" ")),!a.fx.off&&typeof d=="object"&&(i[c+"transition-property"]=Object.keys(d).join(", "),i[c+"transition-duration"]=e+"s",i[c+"transition-timing-function"]=f||"linear")}return n=function(b){if(typeof b!="undefined"){if(b.target!==b.currentTarget)return;a(b.target).unbind(o,arguments.callee)}a(this).css(k),g&&g.call(this)},e>0&&this.bind(o,n),setTimeout(function(){m.css(i),e<=0&&setTimeout(function(){m.each(function(){n.call(this)})},0)},0),this},i=null}(Zepto),function($){function triggerAndReturn(a,b,c){var d=$.Event(b);return $(a).trigger(d,c),!d.defaultPrevented}function triggerGlobal(a,b,c,d){if(a.global)return triggerAndReturn(b||document,c,d)}function ajaxStart(a){a.global&&$.active++===0&&triggerGlobal(a,null,"ajaxStart")}function ajaxStop(a){a.global&&!--$.active&&triggerGlobal(a,null,"ajaxStop")}function ajaxBeforeSend(a,b){var c=b.context;if(b.beforeSend.call(c,a,b)===!1||triggerGlobal(b,c,"ajaxBeforeSend",[a,b])===!1)return!1;triggerGlobal(b,c,"ajaxSend",[a,b])}function ajaxSuccess(a,b,c){var d=c.context,e="success";c.success.call(d,a,e,b),triggerGlobal(c,d,"ajaxSuccess",[b,c,a]),ajaxComplete(e,b,c)}function ajaxError(a,b,c,d){var e=d.context;d.error.call(e,c,b,a),triggerGlobal(d,e,"ajaxError",[c,d,a]),ajaxComplete(b,c,d)}function ajaxComplete(a,b,c){var d=c.context;c.complete.call(d,b,a),triggerGlobal(c,d,"ajaxComplete",[b,c]),ajaxStop(c)}function empty(){}function mimeToDataType(a){return a&&(a==htmlType?"html":a==jsonType?"json":scriptTypeRE.test(a)?"script":xmlTypeRE.test(a)&&"xml")||"text"}function appendQuery(a,b){return(a+"&"+b).replace(/[&?]{1,2}/,"?")}function serializeData(a){isObject(a.data)&&(a.data=$.param(a.data)),a.data&&(!a.type||a.type.toUpperCase()=="GET")&&(a.url=appendQuery(a.url,a.data))}function serialize(a,b,c,d){var e=$.isArray(b);$.each(b,function(b,f){d&&(b=c?d:d+"["+(e?"":b)+"]"),!d&&e?a.add(f.name,f.value):(c?$.isArray(f):isObject(f))?serialize(a,f,c,b):a.add(b,f)})}var jsonpID=0,isObject=$.isObject,document=window.document,key,name,rscript=/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,scriptTypeRE=/^(?:text|application)\/javascript/i,xmlTypeRE=/^(?:text|application)\/xml/i,jsonType="application/json",htmlType="text/html",blankRE=/^\s*$/;$.active=0,$.ajaxJSONP=function(a){var b="jsonp"+ ++jsonpID,c=document.createElement("script"),d=function(){$(c).remove(),b in window&&(window[b]=empty),ajaxComplete("abort",e,a)},e={abort:d},f;return a.error&&(c.onerror=function(){e.abort(),a.error()}),window[b]=function(d){clearTimeout(f),$(c).remove(),delete window[b],ajaxSuccess(d,e,a)},serializeData(a),c.src=a.url.replace(/=\?/,"="+b),$("head").append(c),a.timeout>0&&(f=setTimeout(function(){e.abort(),ajaxComplete("timeout",e,a)},a.timeout)),e},$.ajaxSettings={type:"GET",beforeSend:empty,success:empty,error:empty,complete:empty,context:null,global:!0,xhr:function(){return new window.XMLHttpRequest},accepts:{script:"text/javascript, application/javascript",json:jsonType,xml:"application/xml, text/xml",html:htmlType,text:"text/plain"},crossDomain:!1,timeout:0},$.ajax=function(options){var settings=$.extend({},options||{});for(key in $.ajaxSettings)settings[key]===undefined&&(settings[key]=$.ajaxSettings[key]);ajaxStart(settings),settings.crossDomain||(settings.crossDomain=/^([\w-]+:)?\/\/([^\/]+)/.test(settings.url)&&RegExp.$2!=window.location.host);var dataType=settings.dataType,hasPlaceholder=/=\?/.test(settings.url);if(dataType=="jsonp"||hasPlaceholder)return hasPlaceholder||(settings.url=appendQuery(settings.url,"callback=?")),$.ajaxJSONP(settings);settings.url||(settings.url=window.location.toString()),serializeData(settings);var mime=settings.accepts[dataType],baseHeaders={},protocol=/^([\w-]+:)\/\//.test(settings.url)?RegExp.$1:window.location.protocol,xhr=$.ajaxSettings.xhr(),abortTimeout;settings.crossDomain||(baseHeaders["X-Requested-With"]="XMLHttpRequest"),mime&&(baseHeaders.Accept=mime,mime.indexOf(",")>-1&&(mime=mime.split(",",2)[0]),xhr.overrideMimeType&&xhr.overrideMimeType(mime));if(settings.contentType||settings.data&&settings.type.toUpperCase()!="GET")baseHeaders["Content-Type"]=settings.contentType||"application/x-www-form-urlencoded";settings.headers=$.extend(baseHeaders,settings.headers||{}),xhr.onreadystatechange=function(){if(xhr.readyState==4){clearTimeout(abortTimeout);var result,error=!1;if(xhr.status>=200&&xhr.status<300||xhr.status==304||xhr.status==0&&protocol=="file:"){dataType=dataType||mimeToDataType(xhr.getResponseHeader("content-type")),result=xhr.responseText;try{dataType=="script"?(1,eval)(result):dataType=="xml"?result=xhr.responseXML:dataType=="json"&&(result=blankRE.test(result)?null:JSON.parse(result))}catch(e){error=e}error?ajaxError(error,"parsererror",xhr,settings):ajaxSuccess(result,xhr,settings)}else ajaxError(null,"error",xhr,settings)}};var async="async"in settings?settings.async:!0;xhr.open(settings.type,settings.url,async);for(name in settings.headers)xhr.setRequestHeader(name,settings.headers[name]);return ajaxBeforeSend(xhr,settings)===!1?(xhr.abort(),!1):(settings.timeout>0&&(abortTimeout=setTimeout(function(){xhr.onreadystatechange=empty,xhr.abort(),ajaxError(null,"timeout",xhr,settings)},settings.timeout)),xhr.send(settings.data?settings.data:null),xhr)},$.get=function(a,b){return $.ajax({url:a,success:b})},$.post=function(a,b,c,d){return $.isFunction(b)&&(d=d||c,c=b,b=null),$.ajax({type:"POST",url:a,data:b,success:c,dataType:d})},$.getJSON=function(a,b){return $.ajax({url:a,success:b,dataType:"json"})},$.fn.load=function(a,b){if(!this.length)return this;var c=this,d=a.split(/\s/),e;return d.length>1&&(a=d[0],e=d[1]),$.get(a,function(a){c.html(e?$(document.createElement("div")).html(a.replace(rscript,"")).find(e).html():a),b&&b.call(c)}),this};var escape=encodeURIComponent;$.param=function(a,b){var c=[];return c.add=function(a,b){this.push(escape(a)+"="+escape(b))},serialize(c,a,b),c.join("&").replace("%20","+")}}(Zepto),function(a){a.fn.serializeArray=function(){var b=[],c;return a(Array.prototype.slice.call(this.get(0).elements)).each(function(){c=a(this);var d=c.attr("type");this.nodeName.toLowerCase()!="fieldset"&&!this.disabled&&d!="submit"&&d!="reset"&&d!="button"&&(d!="radio"&&d!="checkbox"||this.checked)&&b.push({name:c.attr("name"),value:c.val()})}),b},a.fn.serialize=function(){var a=[];return this.serializeArray().forEach(function(b){a.push(encodeURIComponent(b.name)+"="+encodeURIComponent(b.value))}),a.join("&")},a.fn.submit=function(b){if(b)this.bind("submit",b);else if(this.length){var c=a.Event("submit");this.eq(0).trigger(c),c.defaultPrevented||this.get(0).submit()}return this}}(Zepto),function(a){function d(a){return"tagName"in a?a:a.parentNode}function e(a,b,c,d){var e=Math.abs(a-b),f=Math.abs(c-d);return e>=f?a-b>0?"Left":"Right":c-d>0?"Up":"Down"}function h(){g=null,b.last&&(b.el.trigger("longTap"),b={})}function i(){g&&clearTimeout(g),g=null}var b={},c,f=750,g;a(document).ready(function(){var j,k;a(document.body).bind("touchstart",function(e){j=Date.now(),k=j-(b.last||j),b.el=a(d(e.touches[0].target)),c&&clearTimeout(c),b.x1=e.touches[0].pageX,b.y1=e.touches[0].pageY,k>0&&k<=250&&(b.isDoubleTap=!0),b.last=j,g=setTimeout(h,f)}).bind("touchmove",function(a){i(),b.x2=a.touches[0].pageX,b.y2=a.touches[0].pageY}).bind("touchend",function(a){i(),b.isDoubleTap?(b.el.trigger("doubleTap"),b={}):b.x2&&Math.abs(b.x1-b.x2)>30||b.y2&&Math.abs(b.y1-b.y2)>30?(b.el.trigger("swipe")&&b.el.trigger("swipe"+e(b.x1,b.x2,b.y1,b.y2)),b={}):"last"in b&&(b.el.trigger("tap"),c=setTimeout(function(){c=null,b.el.trigger("singleTap"),b={}},250))}).bind("touchcancel",function(){c&&clearTimeout(c),g&&clearTimeout(g),g=c=null,b={}})}),["swipe","swipeLeft","swipeRight","swipeUp","swipeDown","doubleTap","tap","singleTap","longTap"].forEach(function(b){a.fn[b]=function(a){return this.bind(b,a)}})}(Zepto);
  if (typeof provide == "function") provide("zepto", module.exports);
  $.ender(module.exports);
}());

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