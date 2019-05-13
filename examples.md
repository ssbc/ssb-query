
# example queries

Here are example queries.
Queries should be valid JSON so that they can be tested on the command line, paste the query inbetween the single quotes: `''`

```
sbot query.read --query '{QUERY GOES HERE}'
```

## channels

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

