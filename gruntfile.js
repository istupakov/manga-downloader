module.exports = function (grunt) {
  grunt.loadNpmTasks("grunt-ts");
  grunt.loadNpmTasks("grunt-tsd");
  grunt.loadNpmTasks("grunt-bower-install-simple");
  grunt.loadNpmTasks('grunt-contrib-copy');

  grunt.initConfig({
    ts: {
      default: {
        files: {
          'release/manga.js': ['src/*.ts'],
        },
        tsconfig: true,
        options: {
          inlineSources: true,
        }
      }
    },
    tsd: {
      refresh: {
        options: {
          command: 'reinstall',
          latest: true,
          config: 'tsd.json',
        }
      }
    },
    "bower-install-simple": {
      options: { color: true, directory: "lib" },
      prod: {
        options: { production: true }
      },
    },
    copy: {
      main: {
        files: [{
          expand: true,
          flatten: true,
          src: ['src/*.js', 'src/*.html', 'src/*.json', 'icons/*.png', 'lib/jquery/dist/jquery.min.js'],
          dest: 'release/'
        }, {
            expand: true,
            flatten: true,
            src: ['lib/zip.js/WebContent/*.js'],
            dest: 'release/zip.js'
          }]
      }
    }
  });

  grunt.registerTask("install", ["tsd", "bower-install-simple"]);
  grunt.registerTask("default", ["copy", "ts"]);
};