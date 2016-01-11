var tar = require('tar')
var fs = require('fs')
var gunzip = require('gunzip-maybe')
var once = require('once')
var eos = require('end-of-stream')

module.exports = function(file,entryBack,done){
  done = once(done||noop)
  var rs = file.pipe?file:fs.createReadStream(file)
  var gz = gunzip()
  var parse = tar.Parse()

  var entries = {}
  parse.on('entry',function(stream){
    entries[stream.path] = stream
    entryBack(stream,once(function(){
      delete entries[stream.path];
      stream.abort()
    }))

    stream.on('end',function(){
      delete entries[stream.path]
    })
    
  })

  eos(rs,onerror)
  eos(gz,onerror)
  // end of stream not trigering for parse streams...
  parse.on('end',function(){
    done()
    //clean up any orphan entries
    //this only happens when the last entry of a tar file is incomplete
    //the parse stream emits end but the entry stream never ends.
    Object.keys(entries).forEach(function(k){
      entries[k].end();
    })
  }).on('error',onerror)

  rs.pipe(gz).pipe(parse)

  return parse;

  function onerror(err){
    if(err) done(err)
  }

}


function noop(){}
