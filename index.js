'use strict';

//core
var http = require('http');
var util = require('util');

//third part
var open = require('yc-open');
var connect = require('connect');
var injectReload = require('connect-livereload');

function prepareOpts(opts) {
    opts.port = opts.port || 8000;
    //default false
    opts.livereload = opts.livereload || false;

    //check if use connect logger middleware
    opts.debug = opts.debug || false;

    //default open
    opts.open = opts.open || true;
}


function parseArgs(source) {
    
    var result = {};

    source.replace(/--([^\s]+)\s+([^\s]+)/g, function($0, $1, $2) {
        if ($0) {
            result[$1] = $2;
        }
    });

    return result;
}


module.exports = function(opts) {

    opts = prepareOpts(opts);

    var middleware = opts.middleware ? opts.middleware.call(this, connect, opts) : [];

    //debug
    if (opts.debug === true) {
        middleware.unshift(connect.logger('dev'));
    }


    //livereload
    if (opts.livereload === true) {
        middleware.unshift(injectReload({
            port: 35729
        }));
    }

    var app = connect.apply(null, middleware)

    var server = http.createServer(app);

    server.listen(opts.port).on('listening', function(){
        var address = server.address();

        //fix open type
        if (opts.open === true) {
            open({
                url: 'http://' + address.address + ':' + address.port
            });
        } else if (typeof opts.open === 'string') {
            open({
                url: opts.open
            });
        }

    }).on('error', function(err){
        if (err.code === 'EADDRINUSE') {
            console.error('Port ' + opts.port + ' is already in use.');
        }
    });

};