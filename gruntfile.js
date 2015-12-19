module.exports = function (grunt) {
    grunt.loadNpmTasks("grunt-ts");
    grunt.loadNpmTasks("grunt-tsd");
    grunt.loadNpmTasks("grunt-bower-install-simple");
    grunt.loadNpmTasks('grunt-contrib-copy');

    grunt.initConfig({
        ts: {
            default: {
                files: {
                    'release/manga-downloader/manga.js': ['src/manga.ts', 'src/parsers/*.ts', 'src/popup.ts'],
                    'release/manga-downloader/background.js': ['src/manga.ts', 'src/parsers/*.ts', 'src/background.ts']
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
                    src: ['src/*.js', 'src/*.html', 'src/*.json', 'src/*.css', 'icons/*.png',
                        'lib/jquery/dist/jquery.min.js', 'lib/jszip/dist/jszip.min.js'],
                    dest: 'release/manga-downloader/'
                }]
            }
        }
    });

    grunt.registerTask("install", ["tsd", "bower-install-simple"]);
    grunt.registerTask("default", ["copy", "ts"]);
};