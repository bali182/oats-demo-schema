import { ReferenceObject, SchemaObject } from '@oats-ts/json-schema-model'
import { getFieldName } from './schemaUtils'
import {
  arraySchema,
  booleanSchema,
  enumSchema as _enumSchema,
  numberSchema,
  referenceOf,
  stringSchema,
} from '../common/schema'

export const registry: Record<string, () => SchemaObject> = {
  ContentCommonEnumType: () => _enumSchema,
  ContentParameterIssue: () => _parameterIssueSchema,
  ContentCommonObjectType: () => _objectSchema,
  ContentCommonObjectTypeExpl: () => _objectSchemaExpl,
  ContentCommonOptObjectType: () => _optObjectSchema,
}

export const enumSchema: ReferenceObject = referenceOf(_enumSchema, registry)

function createObjectSchema(prefix: string): SchemaObject {
  return {
    type: 'object',
    required: [
      getFieldName(stringSchema, false, true, prefix),
      getFieldName(numberSchema, false, true, prefix),
      getFieldName(booleanSchema, false, true, prefix),
      getFieldName(_enumSchema, false, true, prefix),
    ],
    properties: {
      // Required
      [getFieldName(stringSchema, false, true, prefix)]: stringSchema,
      [getFieldName(numberSchema, false, true, prefix)]: numberSchema,
      [getFieldName(booleanSchema, false, true, prefix)]: booleanSchema,
      [getFieldName(_enumSchema, false, true, prefix)]: referenceOf(_enumSchema, registry),
      // Optional
      [getFieldName(stringSchema, true, true, prefix)]: stringSchema,
      [getFieldName(numberSchema, true, true, prefix)]: numberSchema,
      [getFieldName(booleanSchema, true, true, prefix)]: booleanSchema,
      [getFieldName(_enumSchema, true, true, prefix)]: referenceOf(_enumSchema, registry),
    },
  }
}

export const _objectSchema = createObjectSchema('obj')
export const _objectSchemaExpl = createObjectSchema('objExpl')
export const _optObjectSchema = createObjectSchema('optObj')

export const objectSchema = referenceOf(_objectSchema, registry)
export const objectSchemaExpl = referenceOf(_objectSchemaExpl, registry)
export const optObjectSchema = referenceOf(_optObjectSchema, registry)

export const stringArraySchema = arraySchema(stringSchema)
export const numberArraySchema = arraySchema(numberSchema)
export const booleanArraySchema = arraySchema(booleanSchema)
export const enumArraySchema = arraySchema(referenceOf(_enumSchema, registry))

export const _parameterIssueSchema: SchemaObject = {
  type: 'object',
  required: ['message'],
  properties: {
    message: { type: 'string' },
  },
}

export const parameterIssueSchema: ReferenceObject = referenceOf(_parameterIssueSchema, registry)
