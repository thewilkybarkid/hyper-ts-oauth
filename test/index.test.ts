import * as E from 'fp-ts/Either'
import { Status } from 'hyper-ts'
import * as _ from '../src'
import * as fc from './fc'
import { runMiddleware } from './middleware'

describe('hyper-ts-oauth', () => {
  describe('constructors', () => {
    test('requestAuthorizationCode', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.connection(),
          fc.record({
            authorizeUrl: fc.url(),
            clientId: fc.string(),
            clientSecret: fc.string(),
            redirectUri: fc.url(),
            tokenUrl: fc.url(),
          }),
          fc.string(),
          async (connection, oauth, scope) => {
            const actual = await runMiddleware(_.requestAuthorizationCode(scope)({ oauth }), connection)()

            expect(actual).toStrictEqual(
              E.right([
                {
                  type: 'setStatus',
                  status: Status.Found,
                },
                {
                  type: 'setHeader',
                  name: 'Location',
                  value: new URL(
                    `?${new URLSearchParams({
                      client_id: oauth.clientId,
                      response_type: 'code',
                      redirect_uri: oauth.redirectUri.href,
                      scope,
                    }).toString()}`,
                    oauth.authorizeUrl,
                  ).href,
                },
                {
                  type: 'endResponse',
                },
              ]),
            )
          },
        ),
      )
    })
  })
})
