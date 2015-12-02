define([], function(){
  
  "use strict";
  
  function create() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }
  
  return {
    create: create,
    
    createMany: function(count) {
      var guids = [];
      for (var i in count) {
        guids.push(create());
      }
      return guids;
    }
  };
});