
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
  read: 'source'
}

//what are links used for?
//query follows
//query replies
//query mentions (backlinks & mentions)
//query votes

var indexes = [
  {key: 'clk', value: [['value', 'author'], ['value', 'sequence']] },
  {key: 'typ', value: [['value', 'content', 'type']] },
//  {key: 'hsh', value: ['key']},
  {key: 'cha', value: [['value', 'content', 'channel']] },
  {key: 'aty', value: [['value', 'author'], ['value', 'content', 'type']]}
]

//createHistoryStream( id, seq )
//[{$filter: {author: <id>, sequence: {$gt: <seq>}}}, {$map: true}]

//messagesByType (type)

//[{$filter: {content: {type: <type>}}}, {$map: true}]

exports.init = function  (ssb, config) {
  var s = ssb._flumeUse('query', FlumeQuery(indexes, 1))
  var read = s.read
  s.read = function (opts) {
    if(!opts) opts = {}
    if(isString(opts))
      opts = {query: JSON.parse(opts)}
    else if(isString(opts.query))
      opts.query = JSON.parse(opts.query)
    return read(opts)
  }
  return s
}













