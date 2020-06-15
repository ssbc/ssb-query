var pull = require('pull-stream')
var path = require('path')
var FlumeQuery = require('flumeview-query')
var explain = require('explain-error')

function isString(s) {
  return 'string' === typeof s
}

exports.name = 'query'
exports.version = require('./package.json').version
exports.manifest = {
  read: 'source',
  explain: 'sync',
  help: 'sync'
}

//what are links used for?
//query follows
//query replies
//query mentions (backlinks & mentions)
//query votes


var INDEX_VERSION = 10
var indexes = [
  {key: 'log', value: ['timestamp']},
  {key: 'clk', value: [['value', 'author'], ['value', 'sequence']] },
  {key: 'typ', value: [['value', 'content', 'type'], ['timestamp']] },
  {key: 'tya', value: [['value', 'content', 'type'], ['value', 'timestamp']] },
  {key: 'cha', value: [['value', 'content', 'channel'], ['timestamp']] },
  {key: 'aty', value: [['value', 'author'], ['value', 'content', 'type'], ['timestamp']]},
  {key: 'ata', value: [['value', 'author'], ['value', 'content', 'type'], ['value', 'timestamp']]},
  {key: 'art', value: [['value', 'content', 'root'], ['value', 'timestamp']]},
  {key: 'lor', value: [['rts']]}
]

function mapRts (msg) {
  msg.rts = Math.min(msg.timestamp, msg.value.timestamp) || msg.timestamp
  return msg
}

//createHistoryStream( id, seq )
//[{$filter: {author: <id>, sequence: {$gt: <seq>}}}, {$map: true}]

//messagesByType (type)

//[{$filter: {content: {type: <type>}}}, {$map: true}]

exports.init = function  (ssb, config) {
  var s = ssb._flumeUse('query', FlumeQuery(INDEX_VERSION, {indexes: indexes, map: mapRts}))
  var read = s.read
  var explain = s.explain
  s.explain = function (opts) {
    if(!opts) opts = {}
    if(isString(opts))
      opts = {query: JSON.parse(opts)}
    else if(isString(opts.query))
      opts.query = JSON.parse(opts.query)
    return explain(opts)
  }

  s.read = function (opts) {
    if(!opts) opts = {}
    if(isString(opts))
      opts = {query: JSON.parse(opts)}
    else if(isString(opts.query))
      opts.query = JSON.parse(opts.query)
    return read(opts)
  }

  s.help = function () { return require('./help') }
  return s
}

