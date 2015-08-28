var tar = require('tar')
var fs = require('fs')
var gunzip = require('gunzip-maybe')
var once = require('once')
var eos = require('end-of-stream')

module.exports = function(file,entryBack,done){
  done = once(done||noop)
  var rs = fs.createReadStream(file)
  var gz = gunzip()
  var parse = tar.Parse()

  parse.on('entry',function(stream){

    entryBack(stream,once(function(){
      stream.abort()
    }))
    
  })

  eos(rs,onerror)
  eos(gz,onerror)
  // end of stream not trigering for parse streams...
  parse.on('end',function(){
    done()
  }).on('error',onerror)

  rs.pipe(gz).pipe(parse)

  return parse;

  function onerror(err){
    if(err) done(err)
  }

}

// expects an object stream of tar paths
module.exports.batch = function(){

}

function noop(){}
