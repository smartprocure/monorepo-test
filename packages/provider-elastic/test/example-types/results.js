/* eslint-env mocha */
let _ = require('lodash/fp'),
  F = require('futil-js'),
  sequentialResultTest = require('./testUtils').sequentialResultTest

describe('results', () => {
  let schema, context, service, expectedResult, expectedCalls, resultsTest
  beforeEach(() => {
    service = [
      {
        _scroll_id: 1,
        hits: {
          total: 1,
          hits: [
            {
              _id: 'test-id',
              field: 'test field'
            }
          ]
        }
      }
    ]
    schema = {
      elasticsearch: {
        summaryView: _.identity
      }
    }
    expectedResult = {
      scrollId: 1,
      response: {
        totalRecords: 1,
        startRecord: 1,
        endRecord: 1,
        results: [
          {
            _id: 'test-id',
            additionalFields: [],
            field: 'test field'
          }
        ]
      }
    }
    context = {
      key: 'test',
      type: 'results',
      config: {
        highlight: false,
        verbose: false,
        explain: false
      }
    }
    expectedCalls = [
      {
        from: 0,
        size: 10,
        explain: false
      }
    ]
    resultsTest = _.partial(sequentialResultTest, [
      service,
      _,
      expectedResult,
      _,
      schema
    ])
  })

  it('should sort on "_score: desc" with no sortField config', () =>
    resultsTest(context, [
      _.extend(expectedCalls[0], {
        sort: {
          _score: 'desc'
        }
      })
    ]))
  it('should order by sortDir config', () => {
    F.extendOn(context.config, {sortDir: 'asc'})
    return resultsTest(context, [
      _.extend(expectedCalls[0], {
        sort: {
          _score: 'asc'
        }
      })
    ])
  })
  it('should sort on sortField config', () => {
    let sortField = 'test.field'
    F.extendOn(context.config, {sortField: sortField})
    return resultsTest(context, [
      _.extend(expectedCalls[0], {
        sort: {
          [context.config.sortField]: 'desc'
        }
      })
    ])
  })
  it('should strip ".untouched" from sortField config', () => {
    let sortField = 'test.field'
    F.extendOn(context.config, {sortField: sortField + '.untouched'})
    return resultsTest(context, [
      _.extend(expectedCalls[0], {
        sort: {
          [sortField]: 'desc'
        }
      })
    ])
  })
  it('should strip ".untouched" from sortField config when sortMode config is "word"', () => {
    let sortField = 'test.field'
    F.extendOn(context.config, {sortField: sortField, sortMode: 'word'})
    return resultsTest(context, [
      _.extend(expectedCalls[0], {
        sort: {
          [sortField]: 'desc'
        }
      })
    ])
  })
  it('should sort on sortField + ".untouched" when sortMode config is "field"', () => {
    let sortField = 'test.field'
    F.extendOn(context.config, {sortField: sortField, sortMode: 'field'})
    return resultsTest(context, [
      _.extend(expectedCalls[0], {
        sort: {
          [sortField + '.untouched']: 'desc'
        }
      })
    ])
  })
})
