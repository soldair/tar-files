var tar = require('tar')
var fs = require('fs')
var once = require('once')
var eos = require('end-of-stream')

module.exports = function(file,entryBack,done){
  done = once(done||noop)
  var rs = file.pipe?file:fs.createReadStream(file)
  var parse = new tar.Parse()

  var entries = {}
  parse.on('entry',function(stream){
    entries[stream.path] = stream

    entryBack(stream,once(function(){
      delete entries[stream.path];
    }))

    stream.on('end',function(){
      delete entries[stream.path]
    })
    
  })

  eos(rs,onerror)

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

  rs.pipe(parse)

  return parse;

  function onerror(err){
    if(err) done(err)
  }

}


function noop(){}
