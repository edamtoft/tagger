define([
  "system/enumerable"
], function(enumerable){
  
  "use strict";
  
  var states = {
    DEFERED: 0,
    PENDING: 1,
    DONE: 2
  };
  
  function Promise(action) {
    var _promise = this;
    
    var state = states.DEFERED;
    var result = null;
    var err = null;
    
    var whenDone = [];
    
    this.then = function(thenAction) {
      if (state === states.DONE) {
        callAsync(function() { void thenAction(err, result); });
        return _promise;
      }
      
      whenDone.push(thenAction);
      
      if (state === states.DEFERED) {
        state = states.PENDING;
        callAsync(function() { void action(fulfill, reject); });
      }

      return _promise;
    };
    
    function fulfill(data){
      if (state === states.DONE) {
        return;
      }
      state = states.DONE;
      result = data;
      void resolve();
    }
    
    function reject(exception){
      if (state === states.DONE) {
        return;
      }
      state = states.DONE;
      err = exception;
      void resolve();
    }
    
    function resolve() {
      enumerable.of(whenDone).each(function(thenAction){
        void thenAction(err, result);
      });
    }
    
    function callAsync(functionToCall) {
      if (window.setImmediate) {
        window.setImmediate(functionToCall);
        return;
      }
      window.setTimeout(functionToCall, 0);
    }
  }
  
  return {
    that: function(action) {
      return new Promise(action);
    }
  };
});