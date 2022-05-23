/**
 * @since 0.1.0
 */
import * as R from 'fp-ts/Reader'
import { pipe } from 'fp-ts/function'
import { ResponseEnded, StatusOpen } from 'hyper-ts'
import * as RM from 'hyper-ts/lib/ReaderMiddleware'

import Reader = R.Reader
import ReaderMiddleware = RM.ReaderMiddleware

// -------------------------------------------------------------------------------------
// model
// -------------------------------------------------------------------------------------

/**
 * @category model
 * @since 0.1.0
 */
export interface OAuthEnv {
  oauth: {
    authorizeUrl: URL
    clientId: string
    clientSecret: string
    redirectUri: URL
    tokenUrl: URL
  }
}

// -------------------------------------------------------------------------------------
// constructors
// -------------------------------------------------------------------------------------

/**
 * Returns a middleware that requests authorization from the user.
 *
 * @category constructors
 * @since 0.1.0
 */
export function requestAuthorizationCode(
  scope: string,
): ReaderMiddleware<OAuthEnv, StatusOpen, ResponseEnded, never, void> {
  return pipe(
    RM.rightReader(authorizationRequestUrl(scope)),
    RM.ichainW(RM.redirect),
    RM.ichain(() => RM.closeHeaders()),
    RM.ichain(() => RM.end()),
  )
}

// -------------------------------------------------------------------------------------
// utils
// -------------------------------------------------------------------------------------

function authorizationRequestUrl(scope: string): Reader<OAuthEnv, URL> {
  return R.asks(
    ({ oauth: { authorizeUrl, clientId, redirectUri } }) =>
      new URL(
        `?${new URLSearchParams({
          client_id: clientId,
          response_type: 'code',
          redirect_uri: redirectUri.href,
          scope,
        }).toString()}`,
        authorizeUrl,
      ),
  )
}
