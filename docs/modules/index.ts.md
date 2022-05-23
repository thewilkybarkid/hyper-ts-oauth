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
  - [requestAuthorizationCode](#requestauthorizationcode)
- [model](#model)
  - [OAuthEnv (interface)](#oauthenv-interface)

---

# constructors

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
