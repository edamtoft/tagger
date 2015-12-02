define([], function () {

  "use strict";

  function Html(element) {
    var _html = this;

    this.element = function () {
      return element;
    };
    
    this.tag = element.tagName;

    this.addClass = function (className) {
      var classes = element.className.split(/\s+/);
      if (classes.indexOf(className) === -1) {
        classes.push(className);
        element.className = classes.join(" ");
      }

      return _html;
    };

    this.removeClass = function (className) {
      var classes = element.className.split(/\s+/);
      if (classes.indexOf(className) === -1) {
        return _html;
      }
      element.className = classes.filter(function (c) { return c > "" && c !== className; }).join(" ");
      return _html;
    };

    this.value = function (newValue) {
      if (arguments.length === 0) {
        return getValue();
      }
      setValue(newValue);
      return _html;
    };

    this.parent = function () {
      return new Html(element.parentElement);
    };
    
    this.toString = function() {
      return "<"+element.tagName+">";
    };

    function getValue() {
      switch (element.tagName) {
        case "TEXTAREA":
        case "INPUT":
          return element.value;
        case "SELECT":
          return element.items[element.selectedIndex].value;
        default:
          return element.innerHTML;
      }
    }

    function setValue(value) {
      switch (element.tagName) {
        case "TEXTAREA":
        case "INPUT":
          element.value = value || "";
          return;
        case "SELECT":
          for (var i in element.items) {
            if (element.items[i].value == value) {
              element.selectedIndex = i;
              return;
            }
          }
          return;
        default:
          element.innerHTML = value || "";
          return;
      }
    }
  }

  return {
    of: function (element) {
      return new Html(element);
    }
  };
});