import assert from 'assert';
// import { fileURLToPath } from 'url'
import _ from 'lodash';
export const is = {
    string: (val) => typeof val === 'string',
    array: (val) => Array.isArray(val),
    object: (val) => typeof val === 'object' && !Array.isArray(val),
    function: (val) => typeof val === 'function'
};
/**
 * @description alphabetically sorts array
 * @param {array} arr - array to be sorted alphabetically
 * @return {array} array with sorted keys
 */
export function sortAlphabetical(arr) {
    return arr.sort(new Intl.Collator('en').compare);
}
export function sortContributors(arr) {
    if (arr.every(is.object)) {
        return _.sortBy(arr, 'name');
    }
    else if (arr.every(is.string)) {
        return sortAlphabetical(arr);
    }
    return arr;
}
/**
 * @description meta sort function that converts object
 * to array for regular sort functions to consume
 * @param {object} obj - object to be sorted by keys
 * @param {function} sortFn - function that does sorting. it returns a sorted array
 * @return {object} object with sorted keys
 */
export function sortObject(obj, sortFn) {
    const sortedKeys = sortFn(Object.keys(obj));
    const sortedObject = {};
    for (const sortedKey of sortedKeys) {
        sortedObject[sortedKey] = obj[sortedKey];
    }
    return sortedObject;
}
/**
 * @description processes each group
 */
export function processGroup(input, group) {
    const surface = {};
    for (const key of group.keys) {
        // ensure key meets schema requirements
        assert(is.string(key.name), "keys must have a 'name' property of type string");
        // ensure the key actually exists in package.json. if not,
        // 'continue' (skip) to next element in loop
        if (!input.hasOwnProperty(key.name))
            continue;
        // do the reassigning. different behavior dependent if the key
        // value is a 'array', or 'object', or anything else
        const keyName = key.name;
        const keyValue = input[keyName];
        if (!key.hasOwnProperty('sortMethod')) {
            surface[keyName] = keyValue;
        }
        else if (is.array(keyValue)) {
            surface[keyName] = key.sortMethod(keyValue);
        }
        else if (is.object(keyValue)) {
            surface[keyName] = sortObject(keyValue, key.sortMethod);
        }
    }
    return surface;
}
/**
 *  @description when converting from oldSurface to sortedSurface,
 *  sorting keys in oldSurface are not always moved over to sortedSurface.
 *  this function fixes that, adding (and sorting) keys that have not been copied
 *  over to the _top_ of sortedSurface
 *  @param {object} oldSurface - old surface that includes all keys
 *  @param {object} sortedSurface - new sorted surface that may not have all keys as oldSurface
 *  @param {function} [sortingFunction] - function to sort all unrecognized keys by. defualts to alphabetical
 *  @return {object} object with all keys intact
 */
export function ensureUnecognizedKeys(oldSurface, sortedSurface, sortingFunction) {
    // ensure parameters are expected
    assert(is.object(oldSurface));
    assert(is.object(sortedSurface));
    sortingFunction && assert(is.function(sortingFunction));
    let surfaceTemp = {};
    for (const entryName in oldSurface) {
        // add all unknown elements to 'finalOutput' first
        if (oldSurface.hasOwnProperty(entryName) && !sortedSurface.hasOwnProperty(entryName)) {
            surfaceTemp[entryName] = oldSurface[entryName];
        }
    }
    const sortedSurfaceTemp = sortObject(surfaceTemp, sortingFunction || sortAlphabetical);
    return {
        ...sortedSurfaceTemp,
        ...sortedSurface
    };
}
//# sourceMappingURL=util.js.map