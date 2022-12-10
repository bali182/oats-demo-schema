import {
  ComponentsObject,
  ContentObject,
  OpenAPIObject,
  OperationObject,
  ParameterLocation,
  ParameterObject,
  PathsObject,
} from '@oats-ts/openapi-model'
import { Referenceable, SchemaObject } from '@oats-ts/json-schema-model'
import { entries, omit } from 'lodash'
import { ParameterGeneratorConfig } from './typings'
import { configs } from './configs'
import { registry, parameterIssueSchema } from './schema'
import pascalCase from 'pascalcase'
import { getFieldName, getSchema } from './schemaUtils'
import { camelCase } from '../common/camelCase'

function getParameterSchemaName({ location }: ParameterGeneratorConfig): string {
  return `${pascalCase(location)}Parameters`
}

function generateParameterObjects({
  location,
  requiredValues,
  schemaTypes,
}: ParameterGeneratorConfig): ParameterObject[] {
  const params: ParameterObject[] = []
  for (const schemaType of schemaTypes) {
    for (const required of requiredValues) {
      const schema = getSchema(schemaType, required)
      let name = camelCase(getFieldName(schema, !required))
      name = location === 'header' ? `X-${pascalCase(name)}-Header` : name
      const param: ParameterObject = {
        name,
        in: location as ParameterLocation,
        required,
        content: {
          'application/json': {
            schema,
          },
        },
      }
      params.push(param)
    }
  }
  return params
}

function generateParametersSchema(input: ParameterGeneratorConfig): SchemaObject {
  const { location, requiredValues, schemaTypes } = input
  const properties: Record<string, Referenceable<SchemaObject>> = {}
  const requiredProps: string[] = []
  for (const schemaType of schemaTypes) {
    for (const required of requiredValues) {
      const schema = getSchema(schemaType, required)
      let name = camelCase(getFieldName(schema, !required))
      name = location === 'header' ? `X-${pascalCase(name)}-Header` : name
      properties[name] = schema
      if (required) {
        requiredProps.push(name)
      }
    }
  }
  return {
    type: 'object',
    title: getParameterSchemaName(input),
    ...(requiredProps.length > 0 ? { required: requiredProps } : {}),
    properties,
  }
}

function generateParameterOperationObject(input: ParameterGeneratorConfig): OperationObject {
  const parameters = generateParameterObjects(input)
  const content: ContentObject = {
    'application/json': {
      schema: { $ref: `#/components/schemas/${getParameterSchemaName(input)}` },
    },
  }

  return {
    operationId: `${pascalCase(input.location)}Parameters`,
    description: `Endpoint for testing ${input.location} parameters with "content" object`,
    parameters,
    responses: {
      200: {
        description: `Successful response returning all the ${input.location} parameters in an object`,
        content,
      },
      400: {
        description: `Error response on wrong data`,
        content: {
          'application/json': {
            schema: {
              type: 'array',
              items: parameterIssueSchema,
            },
          },
        },
      },
    },
  }
}

function generateUrlTemplate(input: ParameterGeneratorConfig, operation: OperationObject): string {
  const main = `${input.location}-parameters`
  const path = (operation.parameters || [])
    .filter((param: ParameterObject) => param.in === 'path')
    .map(({ name }: ParameterObject) => `{${name}}`)
  return ['', main, ...path].join('/')
}

function generatePathsObject(): PathsObject {
  return configs.reduce((paths: PathsObject, config: ParameterGeneratorConfig) => {
    const operation = generateParameterOperationObject(config)
    const url = generateUrlTemplate(config, operation)
    return {
      ...paths,
      [url]: {
        ['get']: operation,
      },
    }
  }, {})
}

function generateComponentsObject(): ComponentsObject {
  const schemas = configs.reduce((schemas: Record<string, SchemaObject>, config: ParameterGeneratorConfig) => {
    const schema = generateParametersSchema(config)
    return { ...schemas, [schema.title as string]: omit(schema, ['title']) }
  }, {})
  return {
    schemas: {
      ...schemas,
      ...entries(registry).reduce(
        (schemas: Record<string, SchemaObject>, [name, provider]) => ({
          ...schemas,
          [name]: provider(),
        }),
        {},
      ),
    },
  }
}

export function generateContentParametersOpenApiObject(): OpenAPIObject {
  return {
    openapi: '3.0.0',
    info: {
      title: 'ContentParameters',
      version: '1.0',
    },
    paths: generatePathsObject(),
    components: generateComponentsObject(),
  }
}
