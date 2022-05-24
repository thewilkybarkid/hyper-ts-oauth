---
title: index.ts
nav_order: 1
parent: Modules
---

## index overview

Added in v0.1.0

---

<h2 class="text-delta">Table of contents</h2>

- [constructors](#constructors)
  - [exchangeAuthorizationCode](#exchangeauthorizationcode)
  - [requestAuthorizationCode](#requestauthorizationcode)
- [model](#model)
  - [AccessToken (interface)](#accesstoken-interface)
  - [AuthorizationCode (interface)](#authorizationcode-interface)
  - [OAuthEnv (interface)](#oauthenv-interface)

---

# constructors

## exchangeAuthorizationCode

Exchange an authorization code for an access token.

**Signature**

```ts
export declare function exchangeAuthorizationCode<A>(
  decoder: Decoder<JsonRecord, A>
): (code: AuthorizationCode) => RTE.ReaderTaskEither<OAuthEnv & FetchEnv, unknown, AccessToken & A>
export declare function exchangeAuthorizationCode(): (
  code: AuthorizationCode
) => RTE.ReaderTaskEither<OAuthEnv & FetchEnv, unknown, AccessToken>
```

Added in v0.1.0

## requestAuthorizationCode

Returns a middleware that requests authorization from the user.

**Signature**

```ts
export declare function requestAuthorizationCode(
  scope: string
): ReaderMiddleware<OAuthEnv, StatusOpen, ResponseEnded, never, void>
```

Added in v0.1.0

# model

## AccessToken (interface)

**Signature**

```ts
export interface AccessToken {
  readonly access_token: string
  readonly token_type: string
}
```

Added in v0.1.0

## AuthorizationCode (interface)

**Signature**

```ts
export interface AuthorizationCode {
  readonly code: string
}
```

Added in v0.1.0

## OAuthEnv (interface)

**Signature**

```ts
export interface OAuthEnv {
  oauth: {
    authorizeUrl: URL
    clientId: string
    clientSecret: string
    redirectUri: URL
    tokenUrl: URL
  }
}
```

Added in v0.1.0
