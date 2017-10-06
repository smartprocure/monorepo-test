let { expect } = require('chai')
let types = require('../../types')()
let Promise = require('bluebird')
let Contexture = require('contexture')
let provider = require('../../src')
let _ = require('lodash/fp')
let util = require('util')
let testSetup = require('../setup')

let schemaName = 'Documents'
let collection = 'document'

describe('Grouping mongoId', () => {
  it('should work', async () => {
    let {db, ids: [id]} = await testSetup({collection})

    let process = Contexture({
      schemas: {
        [schemaName]: {
          mongo: {
            collection
          }
        }
      },
      providers: {
        mongo: provider({
          getClient: () => db,
          types
        })
      }
    })

    let dsl = {
      type: 'group',
      schema: schemaName,
      join: 'and',
      items: [{
        key: 'specificUser',
        type: 'mongoId',
        field: '_id',
        data: {
          value: id
        }
      }, {
        key: 'results',
        type: 'results'
      }]
    }

    let context = await process(dsl, { debug: true })
    let response = _.last(context.items).context.response
    expect(response.totalRecords).to.equal(1)
    expect(response.results[0]._id.toString()).to.equal(id.toString())
  })
})
