define([], function () {

  "use strict";

  var PARAM_REGEX = /{([^}]+)}/g;

  // Convert to string using a variety of methods
  function from(text) {
    if (typeof text !== "string") {
      return JSON.stringify(text);
    }

    var params = Array.isArray(arguments[1]) ? arguments[1] : arguments;
    var paramStartIndex = Array.isArray(arguments[1]) ? 0 : 1;

    return text.replace(PARAM_REGEX, function (match, key) {
      if (isNaN(parseInt(key))) {
        if (typeof params[paramStartIndex] !== "object") {
          return "";
        }
        return params[paramStartIndex][key].toString() || "";
      }
      var replacementNumber = parseInt(key);
      if (replacementNumber + paramStartIndex >= params.length) {
        return "";
      }
      var item = params[replacementNumber + paramStartIndex];

      if (typeof item === "undefined" || item === null) {
        return "";
      }
      if (typeof item !== "string" && typeof item !== "number") {
        return JSON.stringify(item);
      }
      return item.toString();
    });
  }

  // returns object as a valid url encoded querystring
  function toQuery(object) {
    var parts = [];

    for (var key in object) {
      parts.push(from("{0}={1}", encodeURIComponent(key), encodeURIComponent(object[key])));
    }

    return parts.join("&");
  }

  function fromQuery(queryString) {
    if (!queryString) {
      queryString = window.location.search;
    }
    queryString = queryString.replace(/^\?/, "");
    var out = {};
    var queryElements = queryString.split("&");
    for (var i in queryElements) {
      var parts = queryElements[i].split("=");
      if (parts.length === 2) {
        var key = decodeURIComponent(parts[0]);
        var value = decodeURIComponent(parts[1]);

        out[key] = value;
      }
    }
    return out;
  }

  function camelCase(input) {
    var words = input.split(/[\W]+/);
    var firstWord = words[0];
    var output = firstWord.toLowerCase();
    
    for (var i = 1; i < words.length; i++) {
      var word = words[i][0].toUpperCase() + 
        words[i].substring(1).toLowerCase();
      output += word;
    }
    return output;
  }

  return {
    from: from,
    toQuery: toQuery,
    fromQuery: fromQuery,
    camelCase: camelCase
  };

});