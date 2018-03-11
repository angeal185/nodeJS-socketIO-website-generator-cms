#!/usr/bin/env node

/**
 * Module dependencies.
 */

const app = require('../../../admin'),
debug = require('debug')('app:server'),
http = require('http'),
fs = require('fs'),
urls = require('../urls').urls,
config = require('../config/config'),
os = require('os'),
files = require('../data/files'),
formatBytes = require('../modules/formatBytes'),
modJSON = require('../modules/modJSON'),
elements = require('../../public/data/elements'),
bcrypt = require('bcrypt-nodejs'),
beautify = require('beautify'),
UglifyJS = require("uglify-js"),
CleanCSS = require('clean-css'),
minify = require('html-minifier').minify,
htmlMin = require('../config/htmlMin'),
JSONEdit = require("../modules/JSONEdit"),
html2pug = require('html2pug'),
listFiles = require('../modules/listFiles'),
chalk = require('chalk');

/**
 * Get port from environment and store in Express.
 */

var port = normalizePort(process.env.PORT || config.app.port);
app.set('port', port);

/**
 * Create HTTP server.
 */

var server = http.createServer(app);
//var server = require('http').Server(app);
var io = require('socket.io')(server);
var SocketIOFileUpload = require('socketio-file-upload');

/**
 * Listen on provided port, on all network interfaces.
 */

server.listen(port);
server.on('error', onError);
server.on('listening', onListening);

/**
 * Normalize a port into a number, string, or false.
 */

function normalizePort(val) {
  var port = parseInt(val, 10);

  if (isNaN(port)) {
    // named pipe
    return val;
  }

  if (port >= 0) {
    // port number
    return port;
  }

  return false;
}

/**
 * Event listener for HTTP server "error" event.
 */

function onError(error) {
  if (error.syscall !== 'listen') {
    throw error;
  }

  var bind = typeof port === 'string'
    ? 'Pipe ' + port
    : 'Port ' + port;

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case 'EACCES':
      console.error(bind + ' requires elevated privileges');
      process.exit(1);
      break;
    case 'EADDRINUSE':
      console.error(bind + ' is already in use');
      process.exit(1);
      break;
    default:
      throw error;
  }
}

/**
 * Event listener for HTTP server "listening" event.
 */

function onListening() {
  var addr = server.address();
  var bind = typeof addr === 'string'
    ? 'pipe ' + addr
    : 'port ' + addr.port;
  debug('Listening on ' + bind);
}


//socket.io
io.sockets.on("connection", function(socket){
  console.log(chalk.blueBright('[socketio] '), chalk.greenBright('server listening'));



  var stats = {
    dir:{
      homedir: os.homedir(),
      cwd: process.cwd()
    },
    info:{
      ostype: os.type(),
      platform: os.platform(),
      nodeVersion: process.version
    }
  };

  socket.emit('stats', stats);


  setInterval(function(){
    var statsTimed = {
      cpuUser:formatBytes.formatBytes(process.cpuUsage().user,2),
      cpuSystem:formatBytes.formatBytes(process.cpuUsage().system,2),
      freemem: formatBytes.formatBytes(os.freemem(),2),
      totalmem: formatBytes.formatBytes(os.totalmem(),2),
      uptime: process.uptime(),
      nodeMemUsage:formatBytes.formatBytes(process.memoryUsage().rss,2)
    };
    socket.emit('statsTimed', statsTimed);
  }, 3000);
    // Make an instance of SocketIOFileUpload and listen on this socket:
    var uploader = new SocketIOFileUpload();
    uploader.dir = config.app.uploads;
    uploader.listen(socket);

    // Do something when a file is saved:
    uploader.on("saved", function(event){
        console.log(event.file);
    });

    // Error handler:
    uploader.on("error", function(event){
        console.log("Error from uploader", event);
    });


    socket.on('exportHtml', function(i){
      let outPut = i.toSave;
      let pug = html2pug(i.toSave, {
        tabs: true
      })
      if ((i.fileType) === (".pug")) {
      fs.writeFile(config.app.exportTo + i.fileName + '.pug', pug, 'utf8'),
        function(err) {
          if (err) throw err;
        };
      } else {
        if ((i.output)===('beautify')){
          outPut = beautify(i.toSave, {format: "html"})
        } else if ((i.output)===('minify')){
          outPut = minify(i.toSave, htmlMin)
        }

      fs.writeFile(config.app.exportTo + i.fileName + i.fileType, outPut, 'utf8'),function(err) {
          if (err) throw err;
        };
      }
      io.emit('exportHtml', {"data":"Export success"});
    });




    socket.on('appSettings', function(i){
      console.log('appSettings: ' + i);
      modJSON.path(urls.elements)
        .modify('options[aceTheme]', i.aceTheme);
      io.emit('appSettings', {"aceTheme":i.aceTheme});
    });

    socket.on('adminSettings', function(i){
      console.log('adminSettings: ' + i);
        modJSON.path(urls.config)
          .modify('app[port]', parseInt(i.port))
          .modify('app[uploads]', i.uploads)
          .modify('app[exportTo]', i.exportTo)
          .modify('app[debugToolbar]', JSON.parse(i.debug))
          .modify('app[help]', JSON.parse(i.help))
          .modify('app[audio]', JSON.parse(i.audio))
          .modify('app[login]', JSON.parse(i.login))
          .modify('app[minifyOutput]', JSON.parse(i.minifyOutput));
        io.emit('adminSettings', 'success');
    });

    socket.on('changePassword', function(i){
      console.log('changePassword: ' + i.password);

      bcrypt.genSalt(10, function(err, salt) {
        bcrypt.hash(i.password, salt, null, function(err, hash) {
          console.log(hash);
          modJSON.path(urls.config)
            .modify('users[0][password]', hash);
          io.emit('changePassword', 'success');
        });
      });
    });

    socket.on('readCss', function(i){
      fs.readFile(files.dir.cssDir+i, 'utf8', function read(err, data) {
        if (err) {
            throw err;
        }
        io.emit('readCss', {"title":i,"data":data});
      });
    });

    socket.on('readJs', function(i){
      fs.readFile(files.dir.jsDir+i, 'utf8', function read(err, data) {
        if (err) {
            throw err;
        }
        io.emit('readJs', {"title":i,"data":data});
      });
    });

    socket.on('readJson', function(i){
      fs.readFile(files.dir.jsonDir+i, 'utf8', function read(err, data) {
        if (err) {
            throw err;
        }
        io.emit('readJson', {"title":i,"data":data});
      });
    });



    socket.on('readElements', function(i){
      //console.log('elements: ' + i);
      fs.readFile('./admin/views/elements/'+i, 'utf8', function read(err, data) {
        if (err) {
            throw err;
        }
        //console.log(data);
        io.emit('readElements', {"title":i,"data":data});
      });
    });

    socket.on('readIncludes', function(i){
      //console.log('elements: ' + i);
      fs.readFile('./admin/views/includes/'+i, 'utf8', function read(err, data) {
        if (err) {
            throw err;
        }
        //console.log(data);
        io.emit('readIncludes', {"title":i,"data":data});
      });
    });

    socket.on('readMacros', function(i){
      //console.log('elements: ' + i);
      fs.readFile('./admin/views/macros/'+i, 'utf8', function read(err, data) {
        if (err) {
            throw err;
        }
        //console.log(data);
        io.emit('readMacros', {"title":i,"data":data});
      });
    });

    socket.on('readMainTpl', function(i){
      //console.log('elements: ' + i);
      fs.readFile('./admin/views/'+i, 'utf8', function read(err, data) {
        if (err) {
            throw err;
        }
        //console.log(data);
        io.emit('readMainTpl', {"title":i,"data":data});
      });
    });

    socket.on('readGulp', function(i){
      //console.log('elements: ' + i);
      fs.readFile(i.dir+i.ele, 'utf8', function read(err, data) {
        if (err) {
            throw err;
        }
        //console.log(data);
        io.emit('readGulp', {"title":i.ele,"data":data});
      });
    });

    socket.on('AceConfUpdate', function(i){

        fs.writeFile('./admin/app/config/aceConf.json', i, (err) => {
          if (err) throw err;
          console.log('Ace config updated');
        });
        //console.log(data);
        //io.emit('readElements', {"title":i,"data":data});
    });

    socket.on('editorSave', function(i){

        fs.writeFile(i.dir+i.file, i.data, (err) => {
          if (err) throw err;
          console.log('file:'+ i.file +'updated');
        });
        io.emit('editorSave', {'data':'file: '+ i.file +' updated'});
        //console.log(data);
        //io.emit('readElements', {"title":i,"data":data});
    });

    socket.on('beautify', function(i){
        io.emit('beautify', {"data":beautify(i.data, {format: i.format})});
    });

    socket.on('beautifyBuilder', function(i){
        io.emit('beautifyBuilder', {"data":beautify(i, {format: "html"})});
    });

    socket.on('minifyBuilder', function(i){
      io.emit('minifyBuilder', {"data":minify(i, htmlMin)});
    });


    socket.on('uglifyJs', function(i){
      var data = UglifyJS.minify(i);
      if (data.error) {
        res = "error";
      } else {
        res = data.code;
      }
      console.log(data.error);
      io.emit('uglifyJs', {"data":res});
    });

    socket.on('minCss', function(i){
      var data = new CleanCSS().minify(i);
      io.emit('minCss', {"data":data});
      console.log(data)
    });

    socket.on('minHtml', function(i){
      var data = minify(i, htmlMin);
      io.emit('minHtml', {"data":data});
      console.log(data)
    });

    socket.on('JSONEdit', function(i){
      JSONEdit.fmt.append(i);
      console.log(fmt.flush());
      io.emit('JSONEdit', {"data":i});
      console.log(data)
    });

    socket.on('addNewFile', function(i){

      function toPush(e){
        e.push(i.title);
        //console.log(e)
      }

      if ((i.type) === ('public')){
        if ((i.rout) === ('css')){
          toPush(files.public.css)
        } else if ((i.rout) === ('javascript')){
          toPush(files.public.js)
        } else {
          toPush(files.public.data)
        }
      } else if ((i.type) === ('views')) {
        if ((i.rout) === ('main')){
          toPush(files.views.main)
        } else if ((i.rout) === ('elements')){
          toPush(files.views.elements)
        } else if ((i.rout) === ('includes')){
          toPush(files.views.includes)
        } else {
          toPush(files.views.macros)
        }
      } else if ((i.type) === ('gulp')) {
        toPush(files.gulp)
      }

      fs.writeFile(i.dir+i.title, "", (err) => {
        if (err) throw err;
        console.log('file:'+ i.title +'created');
      });

      fs.writeFile(urls.files+'.json', JSON.stringify(files), (err) => {
        if (err) throw err;
        console.log('files.json updated');
      });

      io.emit('addNewFile', {'data':'file: '+ i.title +' created'});
     //console.log(files)

    });

    socket.on('deleteFile', function(i){

      fs.unlink(i.title);

        if ((i.rout) === ('css')){
          listFiles.listFiles("css");
        } else if ((i.rout) === ('javascript')){
          listFiles.listFiles("js");
        } else if ((i.rout) === ('json')){
          listFiles.listFiles("data");
        } else if ((i.rout) === ('main')){
          listFiles.templatesMain("main");
        } else if ((i.rout) === ('elements')){
          listFiles.templates("elements");
        } else if ((i.rout) === ('includes')){
          listFiles.templates("includes");
        } else if ((i.rout) === ('macros')){
          listFiles.templates("macros");
        } else if ((i.rout) === ('gulp-tasks')){
          listFiles.gulp("gulp");
        } else {
          console.log("error")
        }

      io.emit('addNewFile', {'data':'file: '+ i.title +' deleted'});
     //console.log(files)*/

    });
});
