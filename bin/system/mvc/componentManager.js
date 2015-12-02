define(["system/logManager","system/text","system/enumerable","system/guid","system/mvc/mvc"],function(a,b,c,d,e){"use strict";function f(){function a(a){try{return JSON.parse(a)}catch(b){return a}}function f(f){var j=f.getAttribute("component-id");if(null===j){j=d.create(),f.setAttribute("component-id",j);var k=f.tagName.toUpperCase();!h[k]&&document.registerElement&&(h[k]=document.registerElement(k,{prototype:Object.create(HTMLDivElement.prototype),"extends":"DIV"})),f.style.display="block";var l=b.from("controllers/{0}Controller",b.camelCase(k)),m={},n=f.querySelector("script[type='application/json'][role='config']");n&&(m=JSON.parse(n.innerHTML),f.removeChild(n)),c.of(f.attributes).each(function(c){var d=b.camelCase(c.name);m[d]=a(c.value)}),g.debug("Starting component {0}",k),require([l],function(a){var b=new a(f,m);b.start&&b.start(),i[j]=b,c.of(f.querySelectorAll("[model]")).any()&&e.createComponentScope(j,{view:f,controller:b})},function(a){g.error("Unable to load {0}: {1}",k,a.message)})}}var h={},i={};this.getController=function(a){var b=a.getAttribute("component-id");return b?i[b]||null:null},this.bootstrap=f,this.scan=function(){g.debug("Scanning for components");var a=document.querySelectorAll("*");c.of(a).where(function(a){return-1!==a.tagName.indexOf("-")}).each(function(a){f(a)})}}var g=a.getLogger("Component Loader");return new f});