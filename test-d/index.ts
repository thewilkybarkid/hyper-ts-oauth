import { expectTypeOf } from 'expect-type'
import { ResponseEnded, StatusOpen } from 'hyper-ts'
import * as RM from 'hyper-ts/lib/ReaderMiddleware'
import { requestAuthorizationCode } from '../src'
import * as _ from '../src'

import ReaderMiddleware = RM.ReaderMiddleware
import OAuthEnv = _.OAuthEnv

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
// requestAuthorizationCode
//

expectTypeOf(_.requestAuthorizationCode(string)).toMatchTypeOf<
  ReaderMiddleware<OAuthEnv, StatusOpen, ResponseEnded, never, void>
>()
