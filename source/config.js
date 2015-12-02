(function () {

  "use strict";

  var moduleRoot = "bin/";
  
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
