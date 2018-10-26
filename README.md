# ssb-query

A scuttlebot plugin which implements a [flumeview-query](https://github.com/flumedb/flumeview-query)
index for the scuttlebutt context. `ssb-query` simply used `flumeview-qurey` to use [map-filter-reduce](https://github.com/dominictarr/map-filter-reduce)
querys on ssb data.

from the command line:

get the last 10 `type=post` messages
```
sbot query.read --query '[{"$filter": {"value": {"content": {"type": "post"}}}}]' --limit 10 --reverse
```
notice the json is inside single quotes `''`

or, from inside javascript:

``` js
pull(
  sbot.query.read({
    query: [
      {$filter: {
        value: { content: { type: 'post' } }
      }}
    ],
    limit: 10, reverse: true
  })
  pull.collect(function (err, ary) {
    console.log(ary)
  })
)
```

Documentation of query operators available at [map-filter-reduce](https://github.com/dominictarr/map-filter-reduce)
The if the query has an index available, it will be fast, otherwise it will fall back to a full scan.
Learn more about indexes and how they work at [flumeview-query](https://github.com/flumedb/flumeview-query)

See [index.js](./index.js) for the current list of indexes offered by ssb-query.

## License

MIT


