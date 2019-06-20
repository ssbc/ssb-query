# ssb-query

A scuttlebot plugin for querying data.
With [map-filter-reduce](https://github.com/dominictarr/map-filter-reduce) you can write
pretty flexible queries, similar to SQL, but more javascripty.

`ssb-query` is just a thin layer of glue,
giving access to [flumeview-query](https://github.com/flumedb/flumeview-query)
with secure-scuttlebutt data.


## installation

`ssb-server` is included in the `ssb-server` distribution by default.
[see plugins documentation](https://github.com/ssbc/ssb-plugins)

## usage

### command line

if you are running `ssb-server`, run the following queries from another tab on the same machine.

```
ssb-server query.read --query '{MFR_QUERY}' options...
```

notice the json is inside single quotes `''`. this is necessary, because `"` part of JSON but is [handled
specially on the command line](https://blog.cloud66.com/bash-tricks-part-1-string-escaping/).

see [read](#read) api documentation for options

### javascript

using [`ssb-client`](https://github.com/ssbc/ssb-client),
connect to a locally running sbot and call `query.read`, which returns a [pull-stream](pull-stream.github.io)

```
require('ssb-client')(function (err, sbot) {
  if(err) throw err
  pull(
    sbot.query.read({
      query: MFR_QUERY,
      ...other options
      //limit: 10, reverse: true
    })
    pull.collect(function (err, ary) {
      console.log(ary)
    })
  )
})
```

## api

### query.read ({query,limit,reverse,old,live})

perform a query. `query` is a [map-filter-reduce](https://github.com/dominictarr/map-filter-reduce) query.
`limit,reverse,old` and `live` are standard options supported by most ssb database stream apis,
[see createLogStream](https://github.com/ssbc/ssb-db#ssbdbcreatelogstreamltltegtgte-timestamp-reverseoldliveraw-boolean-limit-number--pullsource)

### query.explain ({query})

returns internal information about what index will be used my `ssb-query`.
the name comes from the [SQL "EXPLAIN" command](https://docs.microsoft.com/en-us/sql/t-sql/queries/explain-transact-sql?view=aps-pdw-2016-au7)

output might look like this:
```
{
  gte: [...], lte: [...] //if this is present, then the query will use an index.
  scan: true | false, //if scan is true, the entire database will be examined. this means a very slow query
  live, old, //wether to include new and old records
  sync: false//include a {sync: true} message after the old records have finished.
}
```
see [flumeview-query](https://github.com/flumedb/flumeview-query) for more information.

## example queries

### all messages in "solarpunk" channel.
```
[{
  "$filter": {
    "content": {channel: "solarpunk"}
  }
}]
```

### all replies in a thread

```
[{
  "$filter": {
    "content": {root: "%<msg_id>"}
  }
}]
```

### messages by a type by an author

```
[{
  "$filter": {
    "content": {author: "@<author_id>", type: "<msg_type>"}
  }
}]
```

### channels, with count and sort

most recently published channels, with timestamp and message count.

```
[
  {"$filter": {"value": {"content":{ "channel": {"$is": "string"}, "type": "post"}}}},
  {"$reduce": {
      "channel": ["value", "content", "channel"],
      "count": {"$count": true},
      "timestamp": {"$max": ["value", "timestamp"]}
  }},
  {"$sort": [["timestamp"], ["count"]]}
]

```

sample output:

```

{
  "channel": "heropunch",
  "count": 83,
  "timestamp": 1537465741596
}

{
  "channel": "walkaway",
  "count": 43,
  "timestamp": 1537471373721
}

{
  "channel": "music",
  "count": 635,
  "timestamp": 1537474414933
}


```
### indexes

indexes make your queries much faster.
[read about flumeview-query indexes](https://github.com/flumedb/flumeview-query#indexes)

currently supported indexes:

```
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

```
so, because the of `cha` index, a query for `value.content.channel` and `timestamp` would be quick.

## License

MIT
