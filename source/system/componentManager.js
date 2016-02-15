define([
    "system/logManager",
    "system/text",
    "system/linq",
    "system/guid",
    "system/mvc/mvc"
], (logManager, text, linq, guid, mvc) => {

    "use strict";

    var log = logManager.getLogger("Component Loader");

    function ComponentManager() {
        let types = {};
        let controllers = {};

        this.getController = element => {
            let componentId = element.getAttribute("component-id");
            if (!componentId) {
                return null;
            }

            return controllers[componentId] || null;
        };

        this.bootstrap = bootstrap;

        this.scan = () => {
            log.debug("Scanning for components");
            let components = document.querySelectorAll("*");

            linq.Enumerable.from(components)
                .where(e => e.tagName.indexOf("-") !== -1 && e.getAttribute("auto-wire-up") !== "false")
                .forEach(component => bootstrap(component));
        };

        function parseType(value) {
            try {
                return JSON.parse(value);
            } catch (err) {
                return value;
            }
        }

        function bootstrap(element) {
            let componentId = element.getAttribute("component-id");
            if (componentId !== null) {
                return;
            }

            componentId = guid.create();
            element.setAttribute("component-id", componentId);

            let componentName = element.tagName.toUpperCase();
            if (!types[componentName] && document.registerElement) {
                types[componentName] = document.registerElement(componentName, {
                    prototype: Object.create(HTMLDivElement.prototype),
                    "extends": "DIV"
                });
            }

            element.style.display = "block";

            let controllerName = text.from("controllers/{0}Controller", text.camelCase(componentName));

            let config = {};
            let configElement = element.querySelector("script[type='application/json'][role='config']");

            if (configElement) {
                config = JSON.parse(configElement.innerHTML);
                element.removeChild(configElement);
            }

            let excludedAttributes = ["class", "style", "id", "title"];

            linq.Enumerable.from(element.attributes)
                .forEach(a => {
                    let key = text.camelCase(a.name);
                    if (excludedAttributes.indexOf(key) >= 0) { return; }
                    config[key] = parseType(a.value);
                });

            log.debug("Starting component {0}", componentName);

            require([controllerName], Controller => {
                let instance = new Controller(element, config);
                if (instance.start) {
                    instance.start();
                }
                controllers[componentId] = instance;

                if (linq.Enumerable.from(element.querySelectorAll("[model]")).any()) {
                    mvc.createComponentScope(componentId, {
                        view: element,
                        controller: instance
                    });
                }
            }, err => {
                log.error("Unable to load {0}: {1}", componentName, err.message);
            });
        }
    }

    return new ComponentManager();
});