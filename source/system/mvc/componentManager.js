define([
  "system/logManager",
  "system/text",
  "system/enumerable",
  "system/guid",
  "system/mvc/mvc"
], function (logManager, text, enumerable, guid, mvc) {

  "use strict";

  var log = logManager.getLogger("Component Loader");

  function ComponentManager() {
    var types = {};
    var controllers = {};

    this.getController = function (element) {
      var componentId = element.getAttribute("component-id");
      if (!componentId) {
        return null;
      }

      return controllers[componentId] || null;
    };

    this.bootstrap = bootstrap;

    this.scan = function () {
      log.debug("Scanning for components");
      var components = document.querySelectorAll("*");

      enumerable.of(components)
        .where(function (e) {
          return e.tagName.indexOf("-") !== -1;
        })
        .each(function (component) {
          bootstrap(component);
        });
    };

    function parseType(value) {
      try {
        return JSON.parse(value);
      } catch (err) {
        return value;
      }
    }

    function bootstrap(element) {
      var componentId = element.getAttribute("component-id");
      if (componentId !== null) {
        return;
      }

      componentId = guid.create();
      element.setAttribute("component-id", componentId);

      var componentName = element.tagName.toUpperCase();
      if (!types[componentName] && document.registerElement) {
        types[componentName] = document.registerElement(componentName, {
          prototype: Object.create(HTMLDivElement.prototype),
          extends: 'DIV'
        });
      }

      element.style.display = "block";

      var controllerName = text.from("controllers/{0}Controller", text.camelCase(componentName));

      var config = {};
      var configElement = element.querySelector("script[type='application/json'][role='config']");

      if (configElement) {
        config = JSON.parse(configElement.innerHTML);
        element.removeChild(configElement);
      }

      enumerable.of(element.attributes)
        .each(function (a) {
          var key = text.camelCase(a.name);
          config[key] = parseType(a.value);
        });

      log.debug("Starting component {0}", componentName);

      require([controllerName], function (Controller) {
        var instance = new Controller(element, config);
        if (instance.start) {
          instance.start();
        }
        controllers[componentId] = instance;

        if (enumerable.of(element.querySelectorAll("[model]")).any()) {
          mvc.createComponentScope(componentId, {
            view: element,
            controller: instance
          });

        }
      }, function (err) {
        log.error("Unable to load {0}: {1}", componentName, err.message);
      });
    }
  }

  return new ComponentManager();
});