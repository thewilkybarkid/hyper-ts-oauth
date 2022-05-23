import { expectTypeOf } from 'expect-type'
import { FetchEnv } from 'fetch-fp-ts'
import * as RTE from 'fp-ts/ReaderTaskEither'
import { ResponseEnded, StatusOpen } from 'hyper-ts'
import * as RM from 'hyper-ts/lib/ReaderMiddleware'
import * as _ from '../src'

import AccessToken = _.AccessToken
import AuthorizationCode = _.AuthorizationCode
import ReaderMiddleware = RM.ReaderMiddleware
import ReaderTaskEither = RTE.ReaderTaskEither
import OAuthEnv = _.OAuthEnv

declare const accessToken: AccessToken
declare const authorizationCode: AuthorizationCode
declare const oAuthEnv: OAuthEnv
declare const string: string

//
// OAuthEnv
//

expectTypeOf(oAuthEnv.oauth.authorizeUrl).toEqualTypeOf<URL>()
expectTypeOf(oAuthEnv.oauth.clientId).toEqualTypeOf<string>()
expectTypeOf(oAuthEnv.oauth.clientSecret).toEqualTypeOf<string>()
expectTypeOf(oAuthEnv.oauth.redirectUri).toEqualTypeOf<URL>()
expectTypeOf(oAuthEnv.oauth.tokenUrl).toEqualTypeOf<URL>()

//
// AccessToken
//

expectTypeOf(accessToken.access_token).toEqualTypeOf<string>()
expectTypeOf(accessToken.token_type).toEqualTypeOf<string>()

//
// AuthorizationCode
//

expectTypeOf(authorizationCode.code).toEqualTypeOf<string>()

//
// requestAuthorizationCode
//

expectTypeOf(_.requestAuthorizationCode(string)).toMatchTypeOf<
  ReaderMiddleware<OAuthEnv, StatusOpen, ResponseEnded, never, void>
>()

//
// exchangeAuthorizationCode
//

expectTypeOf(_.exchangeAuthorizationCode(authorizationCode)).toMatchTypeOf<
  ReaderTaskEither<OAuthEnv & FetchEnv, unknown, AccessToken>
>()
