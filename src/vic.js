/**
 * vic.js v0.1
 * License: http://unlicense.org/UNLICENSE
 */
(function() {

  'use strict';

  (typeof module != 'undefined' && module && module.exports || window).vic = vic;

  /**
   * @param {RegExp} regex The regular expression from which groups are extracted after matching a value
   * @param {Function|Object} [forEachGroup] A function or map (groupIndex:Fn) of functions to be called
   *  on each captured group from the regular expression.
   * @param {Function} [forAll] A function called to determine a complete output for the value, called
   *  after the forEachGroup function(s)
   */
  function vic(regex, forEachGroup, forAll) {
    var _forEachGroup = forEachGroup;
    if (_forEachGroup && typeof _forEachGroup !== 'function') {
      _forEachGroup = function(groupMatch, i, match) {
        var forThisGroup = forEachGroup[
          // An {Object} forEachGroup may contain properties
          // referring to other properties, e.g. { 1: ..., 2: 1 }
          typeof forEachGroup[i] === 'number' ? forEachGroup[i] : i
        ];
        return forThisGroup ? forThisGroup.call(match, groupMatch, i, match) : groupMatch;
      };
    }
    return function(value) {
      var match = String(value).match(regex);
      if (!match) {
        return false;
      }
      if (_forEachGroup) {
        for (var i = regex.global ? 0 : 1, l = match.length; i < l; ++i)
          if (!(match[i] = _forEachGroup.call(match, match[i], i, match))) {
            // A forEachGroup fn that returns false implies invalidation
            return false;
          }
      }
      if (!regex.global) {
        match = match.slice(1); // remove match[0], i.e. full match
      }
      return forAll ? forAll.call(match, match) : match;
    };
  }

  vic.join = function(sep) {
    return function(v) {
      return v.join ? v.join(sep) : v;
    };
  };
  vic.pad = function(str) {
    return function(val) {
      return str.substring(0, str.length - val.length) + val;
    };
  };
  vic.upper = function() {
    return function(val) {
      return val.toUpperCase();
    };
  };
  vic.lower = function() {
    return function(val) {
      return val.toLowerCase();
    };
  };
  vic.numerical = function() {
    return function(val) {
      return !isNaN(val) && val;
    };
  };

}());
