/**
 * @since 0.1.0
 */
import * as F from 'fetch-fp-ts'
import * as E from 'fp-ts/Either'
import * as J from 'fp-ts/Json'
import * as R from 'fp-ts/Reader'
import * as RTE from 'fp-ts/ReaderTaskEither'
import { identity, pipe } from 'fp-ts/function'
import { MediaType, ResponseEnded, Status, StatusOpen } from 'hyper-ts'
import * as RM from 'hyper-ts/lib/ReaderMiddleware'
import * as D from 'io-ts/Decoder'

import Decoder = D.Decoder
import FetchEnv = F.FetchEnv
import Json = J.Json
import JsonRecord = J.JsonRecord
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

/**
 * @category model
 * @since 0.1.0
 */
export interface AccessToken {
  readonly access_token: string
  readonly token_type: string
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
): (state?: string) => ReaderMiddleware<OAuthEnv, StatusOpen, ResponseEnded, never, void> {
  return state =>
    pipe(
      RM.rightReader(authorizationRequestUrl(scope, state)),
      RM.ichainW(RM.redirect),
      RM.ichain(() => RM.closeHeaders()),
      RM.ichain(() => RM.end()),
    )
}

/**
 * Exchange an authorization code for an access token.
 *
 * @category constructors
 * @since 0.1.0
 */
export function exchangeAuthorizationCode<A>(
  decoder: Decoder<JsonRecord, A>,
): (code: string) => RTE.ReaderTaskEither<OAuthEnv & FetchEnv, unknown, AccessToken & A>
export function exchangeAuthorizationCode(): (
  code: string,
) => RTE.ReaderTaskEither<OAuthEnv & FetchEnv, unknown, AccessToken>
export function exchangeAuthorizationCode(decoder: Decoder<JsonRecord, unknown> = D.struct({})) {
  return (code: string) =>
    pipe(
      RTE.asks(({ oauth: { clientId, clientSecret, redirectUri, tokenUrl } }: OAuthEnv) =>
        pipe(
          F.Request('POST')(tokenUrl),
          F.setBody(
            new URLSearchParams({
              client_id: clientId,
              client_secret: clientSecret,
              grant_type: 'authorization_code',
              redirect_uri: redirectUri.href,
              code,
            }).toString(),
            MediaType.applicationFormURLEncoded,
          ),
        ),
      ),
      RTE.chainW(F.send),
      RTE.filterOrElseW(F.hasStatus(Status.OK), identity),
      RTE.chainTaskEitherKW(F.decode(pipe(JsonRecordD, D.compose(pipe(AccessTokenD, D.intersect(decoder)))))),
    )
}

// -------------------------------------------------------------------------------------
// codecs
// -------------------------------------------------------------------------------------

const JsonD: Decoder<string, Json> = {
  decode: s =>
    pipe(
      J.parse(s),
      E.mapLeft(() => D.error(s, 'JSON')),
    ),
}

const JsonRecordD: Decoder<string, JsonRecord> = pipe(
  JsonD,
  D.refine((value: Json): value is JsonRecord => {
    return typeof value === 'object' && value !== null && !Array.isArray(value)
  }, 'JsonRecord'),
)

const AccessTokenD: Decoder<unknown, AccessToken> = D.struct({
  access_token: D.string,
  token_type: D.string,
})

// -------------------------------------------------------------------------------------
// utils
// -------------------------------------------------------------------------------------

function authorizationRequestUrl(scope: string, state?: string): Reader<OAuthEnv, URL> {
  return R.asks(({ oauth: { authorizeUrl, clientId, redirectUri } }) => {
    const query = new URLSearchParams({
      client_id: clientId,
      response_type: 'code',
      redirect_uri: redirectUri.href,
      scope,
    })

    if (typeof state === 'string') {
      query.set('state', state)
    }

    return new URL(`?${query.toString()}`, authorizeUrl)
  })
}
