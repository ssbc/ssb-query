
var pull = require('pull-stream')
var path = require('path')
var Links = require('streamview-links')
var explain = require('explain-error')

exports.name = 'query'
exports.version = require('./package.json').version
exports.manifest = {
  read: 'source', dump: 'source'
}

var indexes = [
  {key: 'clk', value: [['value', 'author'], ['value', 'sequence'], 'timestamp'] },
  {key: 'typ', value: [['value', 'content', 'type'], 'timestamp'] },
  {key: 'hsh', value: ['key', 'timestamp']},
  {key: 'cha', value: [['value', 'content', 'channel'], 'timestamp'] },
//  {key: 'aty', value: [['value', 'author'], ['value', 'content', 'type'], 'ts']}
]

//createHistoryStream( id, seq )
//[{$filter: {author: <id>, sequence: {$gt: <seq>}}}, {$map: true}]

//messagesByType (type)

//[{$filter: {content: {type: <type>}}}, {$map: true}]

exports.init = function  (ssb, config) {

  var dir = path.join(config.path, 'query')

  var version = 13
  //it's really nice to tweak a few things
  //and then change the version number,
  //restart the server and have it regenerate the indexes,
  //all consistent again.
  function id (e, emit) {
    return emit(e)
  }

  var links = Links(dir, indexes, id, version)

  links.init(function (err, since) {
    pull(
      ssb.createLogStream({gt: since || 0, live: true, sync: false}),
      pull.through(function () {
        process.stdout.write('x')
      }),
      links.write(function (err) {
        if(err) throw err
      })
    )
  })

  return {
    dump: function () {
      return links.dump()
    },

    read: function (opts) {
      if(opts && 'string' == typeof opts)
        try { opts = {query: JSON.parse(opts) } } catch (err) {
        return pull.error(err)
      }
      return links.read(opts, function (ts, cb) {
        ssb.sublevel('log').get(ts, function (err, key) {
          if(err) return cb(explain(err, 'missing timestamp:'+ts))
          ssb.get(key, function (err, value) {
            if(err) return cb(explain(err, 'missing key:'+key))
            cb(null, {key: key, value: value, timestamp: ts})
          })
        })
      })
    }
  }
}


