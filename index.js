"use strict";

var through = require('through'),
    gutil = require('gulp-util'),
    crypto = require('crypto'),
    path = require('path');

function appManifest(options) {
    var filename, cwd, contents;

    options = options || {};

    filename = options.filename || 'manifest.json';
    cwd = process.cwd();
    contents = {};
    contents.files = {};
    contents.load = options.load || [];
    contents.root = options.root || './';

    function writeToManifest(file) {

        if (file.isNull())   return;
        if (file.isStream()) return this.emit('error', new gutil.PluginError('gulp-app-manifest', 'Streaming not supported'));

        var hasher = crypto.createHash('sha256');
        var filename = encodeURI(file.relative);
        contents.files[filename] = {};
        contents.files[filename]['filename'] = filename;
        contents.files[filename]['version'] = hasher.update(file.contents, 'binary').digest('hex');
    }

    function endStream() {
        var manifestFile = new gutil.File({
            cwd: cwd,
            base: cwd,
            path: path.join(cwd, filename),
            contents: new Buffer(JSON.stringify(contents))
        });

        this.emit('data', manifestFile);
        this.emit('end');
    }

    return through(writeToManifest, endStream);
}

module.exports = appManifest;
