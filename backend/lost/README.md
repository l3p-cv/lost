# LOST Backend

FastAPI backend for LOST (Label Objects and Save Time).

## Architecture — CCB split

Every API namespace is organized in three layers under `controllers/<name>/`:

- **Endpoint** — `<Name>Endpoint.py`: routes, schemas, response construction, and the
  transport boundary for domain errors (try/except → `Responses`).
- **Coordination** — `<Name>Coordination.py`: thin delegation only.
- **Business** — `<Name>Business.py`: pure domain logic and raises plain `DomainError`
  signals, no HTTP vocabulary.


Shared cross-module infrastructure lives at the controllers root:

- `controllers/Dependencies.py` — auth guards (`require_role`, annotask resource
  guards) and per-module coordination factories.

- `controllers/Responses.py` — static response vocabulary (`ok`, `bad_request`,
  `not_found`, `forbidden`, `unauthorized`, `conflict`, `precondition_failed`,
  `unprocessable`, `internal`, `plain_text`, `no_content`) the only place that
  knows how a legacy response is constructed.

- `controllers/Exceptions.py` — `DomainError` (bare marker base for all module
  domain errors) and `NotAuthorizedError` (the shared guard error; the only
  globally-handled domain error).

- `controllers/AuthorizationService.py` — resource-level authorization helpers.

Multi-module shared utils remain in `logic/` (file_man, file_access, db_access,
dask_session, email, crypt, user, log, template, jobs/, pipeline/ machinery).


## Error handling — the D2 pattern

1. Business raises a plain `DomainError` subclass a signal carrying only domain
   data (no status codes, no response bodies). Module errors are defined in each
   module's Business file (e.g. `label.LabelBusiness.DuplicateLabelTreeError`).
2. The endpoint catches the signal and builds the byte-exact legacy response via
   `Responses`.
3. Standard-body permission checks are dependency guards in `Dependencies.py` 
   they raise `NotAuthorizedError`, which the global handler in `fastapi_app.py`
   maps to the standard 403 body.
4. Anything un-transcribed fails loudly (500 + log).

The layering is enforced by `../tests/architecture/test_layering.py`
(one-way imports, framework-free business/coordination, infra import bans).

See `../tests/README.md` for the golden-snapshot harness and its rules.