module.exports = function(grunt) {

grunt.initConfig({
  
  pkg: grunt.file.readJSON('package.json'),
  
  clean: {
    default: {
      src: ["bin"]
    }
  },
  
  jshint: {
    files: [
      "source/**/*.js"
      ],
    options: {
      globals: {
        jQuery: true
      }
    }
  },
  
  uglify: {
    min: {
      files: grunt.file.expandMapping(["source/**/*.js"], "bin/", {
        rename: function(base, path) {
          return base + path.replace(/^source\//,"");
        }
      })
    }
  },
  
  concat: {
    options: {
      separator: ";",
      stripBanners: true
    },
    default: {
      src: [
        "libraries/require.js", 
        "bin/config.js"
        ],
      dest: "bin/tagger.js"
    }
  }
});

grunt.loadNpmTasks("grunt-contrib-clean");
grunt.loadNpmTasks("grunt-contrib-jshint");
grunt.loadNpmTasks("grunt-contrib-uglify");
grunt.loadNpmTasks("grunt-contrib-concat");

grunt.registerTask("default", ["clean","jshint", "uglify", "concat"]);

};