/**
 * @jest-environment node
*/

var events = require('./events')
const PERSONAL_OAUTH_TOKEN = '54RORZVKSOARZFYDIQ37'
const ORGANIZATION_ID = '217145347272'

describe('Events', () => {
  it('gets an organization ID', async () => {
    const organizationId = await events.getOrganizationId(PERSONAL_OAUTH_TOKEN)
    expect(organizationId).toBe(ORGANIZATION_ID)
  })

  it('gets a list of events for an organization', async () => {
    const eventBriteEvents = await events.fetchEvents(PERSONAL_OAUTH_TOKEN, ORGANIZATION_ID)

  })
})
