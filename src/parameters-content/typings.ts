import { ParameterLocation } from '@oats-ts/openapi-model'

export type SchemaType =
  | 'string'
  | 'number'
  | 'boolean'
  | 'enum'
  | 'string-array'
  | 'number-array'
  | 'boolean-array'
  | 'enum-array'
  | 'object'

export type ParameterGeneratorConfig = {
  location: ParameterLocation | 'response-header'
  requiredValues: boolean[]
  schemaTypes: SchemaType[]
}
