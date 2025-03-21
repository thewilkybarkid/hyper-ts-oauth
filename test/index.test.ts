import fetchMock from 'fetch-mock'
import * as E from 'fp-ts/Either'
import { MediaType, Status } from 'hyper-ts'
import * as D from 'io-ts/Decoder'
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
          fc
            .tuple(
              fc.record(
                {
                  scope: fc.string(),
                  state: fc.string(),
                },
                { requiredKeys: ['scope'] },
              ),
              fc.dictionary(fc.string({ minLength: 1 }), fc.string({ minLength: 1 })),
            )
            .map(([one, two]) => ({ ...two, ...one } as Record<string, string>)),
          async (connection, oauth, { scope, state, ...options }) => {
            const actual = await runMiddleware(
              _.requestAuthorizationCode(scope)(state, options)({ oauth }),
              connection,
            )()

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
                      ...options,
                      client_id: oauth.clientId,
                      response_type: 'code',
                      redirect_uri: oauth.redirectUri.href,
                      scope,
                      ...(typeof state === 'string' ? { state } : {}),
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

    describe('exchangeAuthorizationCode', () => {
      test('exchanges the code for an access token', async () => {
        await fc.assert(
          fc.asyncProperty(
            fc.string(),
            fc.record({
              authorizeUrl: fc.url(),
              clientId: fc.string(),
              clientSecret: fc.string(),
              redirectUri: fc.url(),
              tokenUrl: fc.url(),
            }),
            fc.record({
              access_token: fc.string(),
              token_type: fc.constant('Bearer'),
            }),
            fc.string(),
            async (code, oauth, accessToken) => {
              const actual = await _.exchangeAuthorizationCode()(code)({
                oauth,
                fetch: fetchMock.sandbox().postOnce(
                  {
                    url: oauth.tokenUrl.href,
                    functionMatcher: (_, req: RequestInit) =>
                      req.body ===
                      new URLSearchParams({
                        client_id: oauth.clientId,
                        client_secret: oauth.clientSecret,
                        grant_type: 'authorization_code',
                        redirect_uri: oauth.redirectUri.href,
                        code,
                      }).toString(),
                    headers: {
                      'Content-Type': MediaType.applicationFormURLEncoded,
                    },
                  },
                  {
                    status: Status.OK,
                    body: accessToken,
                  },
                ),
              })()

              expect(actual).toStrictEqual(E.right(accessToken))
            },
          ),
        )
      })

      test('when the token API returns an access token with other details', async () => {
        await fc.assert(
          fc.asyncProperty(
            fc.string(),
            fc.record({
              authorizeUrl: fc.url(),
              clientId: fc.string(),
              clientSecret: fc.string(),
              redirectUri: fc.url(),
              tokenUrl: fc.url(),
            }),
            fc.record({
              access_token: fc.string(),
              token_type: fc.constant('Bearer'),
              name: fc.string(),
            }),
            fc.string(),
            async (code, oauth, accessToken) => {
              const actual = await _.exchangeAuthorizationCode(
                D.struct({
                  name: D.string,
                }),
              )(code)({
                oauth,
                fetch: fetchMock.sandbox().postOnce(
                  {
                    url: oauth.tokenUrl.href,
                    functionMatcher: (_, req: RequestInit) =>
                      req.body ===
                      new URLSearchParams({
                        client_id: oauth.clientId,
                        client_secret: oauth.clientSecret,
                        grant_type: 'authorization_code',
                        redirect_uri: oauth.redirectUri.href,
                        code,
                      }).toString(),
                    headers: {
                      'Content-Type': MediaType.applicationFormURLEncoded,
                    },
                  },
                  {
                    status: Status.OK,
                    body: accessToken,
                  },
                ),
              })()

              expect(actual).toStrictEqual(E.right(accessToken))
            },
          ),
        )
      })

      test('when the token API does not return a valid access token', async () => {
        await fc.assert(
          fc.asyncProperty(
            fc.string(),
            fc.record({
              authorizeUrl: fc.url(),
              clientId: fc.string(),
              clientSecret: fc.string(),
              redirectUri: fc.url(),
              tokenUrl: fc.url(),
            }),
            fc.jsonValue(),
            fc.string(),
            async (code, oauth, body) => {
              const actual = await _.exchangeAuthorizationCode()(code)({
                oauth,
                fetch: fetchMock.sandbox().postOnce(
                  {
                    url: oauth.tokenUrl.href,
                    functionMatcher: (_, req: RequestInit) =>
                      req.body ===
                      new URLSearchParams({
                        client_id: oauth.clientId,
                        client_secret: oauth.clientSecret,
                        grant_type: 'authorization_code',
                        redirect_uri: oauth.redirectUri.href,
                        code,
                      }).toString(),
                    headers: {
                      'Content-Type': MediaType.applicationFormURLEncoded,
                    },
                  },
                  {
                    status: Status.OK,
                    body,
                  },
                ),
              })()

              expect(actual).toStrictEqual(E.left(expect.anything()))
            },
          ),
        )
      })
    })

    test('when the token API is unavailable', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.string(),
          fc.record({
            authorizeUrl: fc.url(),
            clientId: fc.string(),
            clientSecret: fc.string(),
            redirectUri: fc.url(),
            tokenUrl: fc.url(),
          }),
          fc.record({
            access_token: fc.string(),
            token_type: fc.constant('Bearer'),
          }),
          fc.string(),
          async (code, oauth, accessToken) => {
            const actual = await _.exchangeAuthorizationCode()(code)({
              oauth,
              fetch: fetchMock.sandbox().postOnce(
                {
                  url: oauth.tokenUrl.href,
                  functionMatcher: (_, req: RequestInit) =>
                    req.body ===
                    new URLSearchParams({
                      client_id: oauth.clientId,
                      client_secret: oauth.clientSecret,
                      grant_type: 'authorization_code',
                      redirect_uri: oauth.redirectUri.href,
                      code,
                    }).toString(),
                  headers: {
                    'Content-Type': MediaType.applicationFormURLEncoded,
                  },
                },
                {
                  status: Status.ServiceUnavailable,
                  body: accessToken,
                },
              ),
            })()

            expect(actual).toStrictEqual(
              E.left(
                expect.objectContaining({
                  status: Status.ServiceUnavailable,
                  url: oauth.tokenUrl.href,
                }),
              ),
            )
          },
        ),
      )
    })
  })
})
