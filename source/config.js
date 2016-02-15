(function () {

  "use strict";

  var moduleRoot = "./";
  
  requirejs.config({
    baseUrl: moduleRoot,
    paths: {
      async: "plugins/async"
    }
  });
  
  require(["system/componentManager"], function(componentManager) {
    componentManager.scan();
  });

})();
