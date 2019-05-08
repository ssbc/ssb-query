var Query = {
  type: 'JSONString',
  description: 'the query it self. It should be the format of a map-filter-reduce query',
  optional: false
}
module.exports = {
  description: 'query ssb database with map-filter-reduce queries',
  commands: {
    read: {
      type: 'source',
      description: 'perform a query',
      args: {
        query: Query,
        limit: {
          type: 'number',
          description: 'number of items to return',
          optional: true
        },
        reverse: {
          type: 'boolean',
          description: 'reverse order of output',
          optional: true,
        },
        live: {
          type: 'boolean',
          description: 'include real time output',
          optional: true,
        },
        old: {
          type: 'boolean',
          description: 'include old output, defaults to true',
          optional: true
        }
      }
    },
    explain: {
      type: 'sync',
      description: 'return object describing indexes ssb-query will use for this query, useful for debugging performance problems'
      args: {
        query: Query
      }
    }
  }
}

