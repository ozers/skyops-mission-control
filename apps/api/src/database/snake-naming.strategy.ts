import { DefaultNamingStrategy, NamingStrategyInterface } from 'typeorm';

function toSnakeCase(input: string): string {
  return input
    .replace(/([a-z\d])([A-Z])/g, '$1_$2')
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1_$2')
    .toLowerCase();
}

/* Maps camelCase entity fields to snake_case columns so raw SQL migrations read naturally. */
export class SnakeNamingStrategy extends DefaultNamingStrategy implements NamingStrategyInterface {
  override tableName(targetName: string, userSpecifiedName: string | undefined): string {
    return userSpecifiedName ?? toSnakeCase(targetName);
  }

  override columnName(
    propertyName: string,
    customName: string,
    embeddedPrefixes: string[],
  ): string {
    const base = customName || toSnakeCase(propertyName);
    if (embeddedPrefixes.length === 0) {
      return base;
    }
    return `${toSnakeCase(embeddedPrefixes.join('_'))}_${base}`;
  }
}
