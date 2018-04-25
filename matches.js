import {isMatchWith, curry} from 'lodash/fp';

/**
 * Matches object against the given pattern.
 *
 * Similar to LoDash.matches(), but with the addition that a Function
 * can be provided to assert various conditions e.g. checking that
 * number is within a certain range.
 *
 * Additionally there are utility functions:
 *
 * - extract() can be used to give names to the parts of object -
 *   these are then returned as a map of key-value pairs.
 *
 * - matchesLength() ensures the exact array length is respected.
 *
 * @param {Object} pattern Pattern to test against
 * @param {Object} obj The object to test
 * @return {Object|Boolean} an object with extracted fields
 * or false when no match found.
 */
export const matches = curry((pattern, obj) => {
  const extractedFields = {};

  const success = isMatchWith((value, matcher) => {
    if (typeof matcher === 'function') {
      const result = matcher(value);
      if (typeof result === 'object') {
        Object.assign(extractedFields, result);
      }
      return result;
    }
  }, pattern, obj);

  return success ? extractedFields : false;
});

/**
 * Utility for extracting values during matching with matches()
 *
 * @param {String} fieldName The name to give for the value
 * @param {Function|Object} matcher Optional matching function or pattern for matches()
 * @param {Object} obj The object to be tested and captured.
 * @return {Boolean|Object} False when no match found.
 */
export const extract = curry((fieldName, matcher, obj) => {
  const extractedFields = {[fieldName]: obj};

  if (typeof matcher === 'object') {
    matcher = matches(matcher);
  }

  if (typeof matcher === 'function') {
    const result = matcher(obj);
    if (typeof result === 'object') {
      return Object.assign(extractedFields, result);
    }
    if (!result) {
      return false;
    }
  }

  return extractedFields;
});

/**
 * Like extract, but does not take the matcher argument,
 * matching anything instead.
 *
 * @param {String} fieldName The name to give for the value.
 * @param {Object} obj The object to be tested and captured.
 * @return {Boolean|Object} False when no match found.
 */
export const extractAny = curry((fieldName, obj) => extract(fieldName, undefined, obj));

/**
 * Utility for asserting that two arrays match,
 * and their length also equals.
 * (in addition to the normal behavior of matches()
 * to simply compare the first items in the array).
 *
 * @param {Array} pattern
 * @param {Array} array the array to match against
 * @return {Boolean|Object} False on failure to match
 */
export const matchesLength = curry((pattern, array) => {
  if (array.length !== pattern.length) {
    return false;
  }
  return matches(pattern, array);
});
