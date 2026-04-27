---
sidebar_position: 1
---

# OpenID Connect

LOST supports authentication via an external Identity Provider (IDP) using the
[OpenID Connect](https://openid.net/developers/how-connect-works/) (OIDC) protocol.
Once configured, a dedicated login button appears on the LOST login page and users
are redirected to the IDP for authentication. On first login, LOST automatically
creates a local account and assigns roles based on the user's IDP group membership.
Subsequent logins reuse the existing account and keep roles in sync with the IDP.

:::note
LOST's OIDC integration has been developed and tested against
[Authentik](https://goauthentik.io/). Other OIDC-compliant providers should work
as well, but may require minor adjustments to the endpoint path variables.
:::

## Authentication Flow

```mermaid
%%{init: {'theme': 'base', 'themeVariables': {
  'primaryColor': '#5E81AC',
  'primaryTextColor': '#ECEFF4',
  'primaryBorderColor': '#4C566A',
  'secondaryColor': '#88C0D0',
  'tertiaryColor': '#A3BE8C',
  'lineColor': '#4C566A',
  'textColor': '#2E3440',
  'signalColor': '#4C566A',
  'signalTextColor': '#2E3440',
  'actorBkg': '#5E81AC',
  'actorBorder': '#4C566A',
  'actorTextColor': '#ECEFF4',
  'noteBkgColor': '#E5E9F0',
  'noteBorderColor': '#4C566A'
}}}%%
sequenceDiagram
    participant U as Browser
    participant F as LOST Frontend
    participant B as LOST Backend
    participant I as Identity Provider

    U->>F: Open LOST login page
    F-->>U: Show "Login with <IDP>" button
    U->>B: GET /api/auth/openid/login
    B-->>U: 302 Redirect → IDP authorization endpoint
    U->>I: Authorization request (client_id, redirect_uri, scope)
    activate I
    I-->>U: Show IDP login form
    U->>I: Submit credentials
    I-->>U: 302 Redirect → LOST callback URL + ?code=...
    deactivate I
    U->>B: GET /api/auth/openid/callback?code=...
    activate B
    B->>I: POST /token (code exchange)
    I-->>B: id_token + access_token
    Note over B: Verify id_token signature<br/>(JWKS / RS256), iss, aud, exp
    B->>B: Look up or create local user account
    B->>B: Sync roles from IDP groups
    B->>B: Issue JWT pair, store under one-time temp code
    B-->>U: 302 Redirect → Frontend /auth/callback?code=<temp_code>
    deactivate B
    U->>F: Load /auth/callback?code=<temp_code>
    F->>B: POST /api/auth/openid/token {code: <temp_code>}
    B-->>F: {token, refreshToken}
    F-->>U: Authenticated session
```

## IDP Setup

Before configuring LOST, register an OAuth2/OIDC application in your IDP:

1. Create an **OAuth2 Provider** with the **Authorization Code** flow.
2. Set the **Redirect URI** (callback URL) to:

   ```
   https://<your-lost-domain>/api/auth/openid/callback
   ```

3. Note down the **Client ID**, **Client Secret**, and the **base URL** of your IDP.
4. Ensure the IDP issues `id_token`s containing the following claims:
   - `preferred_username` *(required)* — used as the LOST username
   - `email` *(optional)*
   - `given_name` / `family_name` or `name` *(optional)*

## Environment Variables

Add the following variables to your `.env` file (backend):

```bash
# Full JWKS URI of your IDP (used to verify id_token signatures)
# Authentik example: https://auth.example.com/application/o/<app-slug>/jwks/
LOST_OPENID_JWKS_URI=https://auth.example.com/application/o/lost/jwks/

# Authorization endpoint of your IDP
LOST_OPENID_AUTH_ENDPOINT=https://auth.example.com/application/o/authorize/

# Token endpoint of your IDP
LOST_OPENID_TOKEN_ENDPOINT=https://auth.example.com/application/o/token/

# OAuth2 client credentials registered at the IDP
LOST_OPENID_CLIENT_ID=your-client-id
LOST_OPENID_CLIENT_SECRET=your-client-secret

# Callback URL – must match the Redirect URI registered at the IDP
LOST_OPENID_REDIRECT_URI=https://<your-lost-domain>/api/auth/openid/callback

# IDP group names that map to LOST roles (case-insensitive)
LOST_OPENID_ANNOTATOR_GROUP_NAME=lost-annotators
LOST_OPENID_ADMIN_GROUP_NAME=lost-admins

# JWT verification settings
LOST_JWT_ALGORITHM=RS256
LOST_JWT_ISSUER=https://auth.example.com/application/o/lost/

# Public URL of the LOST frontend (used for the post-login redirect)
LOST_FRONTEND_URL=https://<your-lost-domain>
```

Additionally, set the following variable in your frontend environment (e.g. in your
`compose.yaml` as a build argument or in your Vite `.env` file). This controls
the label shown on the login button. **If this variable is not set, the OIDC login
button is hidden and OIDC authentication is disabled.**

```bash
VITE_LOST_OPENID_NAME=My IDP
```

### Variable Reference

| Variable | Required | Description |
|---|---|---|
| `LOST_OPENID_JWKS_URI` | Yes | Full JWKS URI of the IDP; used to fetch public keys for `id_token` verification |
| `LOST_OPENID_AUTH_ENDPOINT` | Yes | Authorization endpoint URL of the IDP |
| `LOST_OPENID_TOKEN_ENDPOINT` | Yes | Token endpoint URL of the IDP |
| `LOST_OPENID_CLIENT_ID` | Yes | OAuth2 client ID registered at the IDP |
| `LOST_OPENID_CLIENT_SECRET` | Yes | OAuth2 client secret |
| `LOST_OPENID_REDIRECT_URI` | Yes | Callback URL; must match the Redirect URI registered at the IDP |
| `LOST_OPENID_ANNOTATOR_GROUP_NAME` | Yes | IDP group name whose members receive the **Annotator** role in LOST (case-insensitive) |
| `LOST_OPENID_ADMIN_GROUP_NAME` | Yes | IDP group name whose members receive the **Administrator** role in LOST (case-insensitive) |
| `LOST_JWT_ALGORITHM` | No | Algorithm for `id_token` signature verification. Default: `RS256` |
| `LOST_JWT_ISSUER` | No | Expected `iss` claim in the `id_token`. Default: `http://localhost:9000/application/o/cm/` |
| `LOST_FRONTEND_URL` | Yes | Public URL of the LOST frontend; used for the post-login redirect |
| `VITE_LOST_OPENID_NAME` | Yes | Display name shown on the login button; **omitting this disables OIDC** |

## User Management

- Users logging in via OIDC for the **first time** are automatically created. Their role (**Annotator** and/or **Administrator**) is determined by their IDP group membership, configured via `LOST_OPENID_ANNOTATOR_GROUP_NAME` and `LOST_OPENID_ADMIN_GROUP_NAME`.
- On every subsequent login, LOST **re-syncs** the user's roles with the current IDP group membership. Roles are added or removed automatically.
- Users who belong to **neither** configured group are denied access (`403 Forbidden`).
- LOST matches accounts by `preferred_username`. If a local account with the same username already exists, the OIDC login will use that existing account and sync its roles.

:::warning
If a local account with the same `preferred_username` already exists, that account
will be used for the OIDC login. Make sure usernames are consistent between your
IDP and any pre-existing local LOST accounts to avoid unintended account takeovers.
:::

## Token Exchange Flow

After the IDP redirects back to LOST, the backend issues a JWT pair but does **not**
embed it in the redirect URL. Instead, it stores the tokens server-side under a
short-lived, single-use **temp code** and redirects the browser to:

```
{LOST_FRONTEND_URL}/auth/callback?code=<temp_code>
```

The frontend must exchange the temp code for the real tokens by posting to:

```
POST /api/auth/openid/token
{"code": "<temp_code>"}
```

The code expires after **60 seconds** and is deleted on first use. This prevents
JWTs from appearing in browser history, referrer headers, or server logs.
