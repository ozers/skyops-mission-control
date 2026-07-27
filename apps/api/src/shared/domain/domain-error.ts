export type DomainErrorKind = 'validation' | 'conflict' | 'not-found';

/*
 * Base for every business-rule error. The `kind` lets the interface layer map a
 * domain failure to an HTTP status without the domain knowing about HTTP.
 */
export abstract class DomainError extends Error {
  abstract readonly kind: DomainErrorKind;
}
