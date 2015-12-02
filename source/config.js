(function () {

  "use strict";

  var moduleRoot = "/dist/";
  
  requirejs.config({
    baseUrl: moduleRoot,
    paths: {
      async: "plugins/async"
    }
  });
  
  require(["system/mvc/componentManager"], function(componentManager) {
    componentManager.scan();
  });

})();
