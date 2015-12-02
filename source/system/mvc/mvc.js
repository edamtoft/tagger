
define([
  "system/enumerable",
  "system/mvc/componentManager",
  "system/logManager",
  "system/mvc/html"
], function (enumerable, componentManager, logManager, html) {

  "use strict";

  var log = logManager.getLogger("MVC Binder");

  function MvcManager() {
    var scopes = {};

    this.createComponentScope = function (id, scope) {
      log.debug("Creating MVC scope for component {0}", id);

      if (scope instanceof MvcScope) {
        return (scopes[id] = scope);
      }
      return (scopes[id] = new MvcScope(scope.controller, scope.view));
    };

    this.MvcScope = MvcScope;
  }

  function MvcScope(controller, view) {
    var bindings;
    var eventElements;
    var _scope = this;

    this.model = controller.model || (controller.model = {});

    this.controller = controller;

    this.updateView = function (modelKey) {
      enumerable.of(bindings[modelKey])
        .select(function (b) {
          return html.of(b.element);
        })
        .where(function (e) {
          return e.value() != _scope.model[modelKey];
        })
        .each(function (e) {
          log.debug("updating model.{0} on element {1}", modelKey, e.toString());
          e.value(_scope.model[modelKey]);
        });
    };

    function bootstrap() {
      bindings = {};
      eventElements = [];

      enumerable.of(view.querySelectorAll("[model]")).each(function (e) {
        var bindingName = e.getAttribute("model");
        if (!bindings[bindingName]) {
          bindings[bindingName] = [];
        }
        var binding = bindings[bindingName];
        binding.push(new MvcModelElement(e, _scope));
      });

      enumerable.of(view.querySelectorAll("[event]")).each(function (e) {
        eventElements.push(new MvcEventElement(e, _scope));
      });
    }

    bootstrap();
  }

  function MvcModelElement(source, scope) {
    var modelKey = source.getAttribute("model");
    
    this.element = source;
    this.modelKey = modelKey;

    function attach() {
      enumerable.of(getRelevantEvents(source.tagName)).each(function (event) {
        source.addEventListener(event, updateModel);
      });
    }

    function getRelevantEvents() {
      switch (source.tagName) {
        case "TEXTAREA":
        case "INPUT":
          return ["change", "keyup"];
        case "SELECT":
          return ["change"];
        default:
          return [];
      }
    }

    function updateModel() {
      var value = html.of(source).value();

      if (value != scope.model[modelKey]) {
        scope.model[modelKey] = value;
        scope.updateView(modelKey);

        if (scope.controller.modelChanged) {
          scope.controller.modelChanged(modelKey, source, value);
        }
      }
    }

    attach();
  }

  function MvcEventElement(source, scope) {
    var eventName = source.getAttribute("event");
    var eventTriggers = null;
    
    if (eventName.indexOf(":") !== -1) {
      var parsed = eventName.split(":");
      eventName = parsed[1];
      eventTriggers = parsed[0].split(",");
    }

    var eventHandler = scope.controller[eventName] || null;

    this.element = source;

    if (eventHandler) {
      attach();
    }

    function attach() {
      enumerable.of(eventTriggers || getRelevantEvents(source.tagName)).each(function (event) {
        source.addEventListener(event, dispatchEvent);
      });
    }

    function dispatchEvent() {
      if (source.disabled) {
        return;
      }
      log.info("Event {0} fired.", eventName);
      if (eventHandler.length > 0) {
        source.disabled = true;
        eventHandler.apply(scope, [reset]);
      } else {
        eventHandler.apply(scope);
      }

    }

    function reset() {
      source.disabled = false;
    }

    function getRelevantEvents() {
      switch (source.tagName) {
        case "TEXTAREA":
        case "INPUT":
          return ["change", "keyup"];
        case "SELECT":
          return ["change"];
        default:
          return ["click"];
      }
    }


  }

  return new MvcManager();
});