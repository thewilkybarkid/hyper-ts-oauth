/**
 * @since 0.1.0
 */
import { ResponseEnded, StatusOpen } from 'hyper-ts'
import * as RM from 'hyper-ts/lib/ReaderMiddleware'

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
export declare function requestAuthorizationCode(
  scope: string,
): ReaderMiddleware<OAuthEnv, StatusOpen, ResponseEnded, never, void>
