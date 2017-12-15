var test = require('tape')
var fs = require('fs')
var te = require('../')
var eos = require('end-of-stream')

test("can read tar",function(t){
  t.plan(2)

  var count = 0;

  var tmpFile = __dirname+'/'+Date.now()+'-README.md'

  te(__dirname+'/fixture.tgz',function(stream,cb){
    count++;

    if(stream.path === "package/README.md") {

      console.log('readme!')

      eos(stream.pipe(fs.createWriteStream(tmpFile)),cb)
    } else {
      // skip this entry
      stream.resume()
      cb();
    }

  },function(err){
    t.ok(!err,'should not have error')
    var readme = fs.readFileSync(tmpFile)+''
    fs.unlinkSync(tmpFile)
    t.ok(readme.length,7726,'should have whole readme')
  })
})
