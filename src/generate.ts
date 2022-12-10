import { promises as fs } from 'fs'
import { resolve } from 'path'
import { OpenAPIObject } from '@oats-ts/openapi-model'
import { generateBodiesOpenApiObject } from './bodies/generateBodiesOpenApiObject'
import { generateHttpMethodsOpenApiObject } from './methods/generateHttpMethodsOpenApiObject'
import { generateParametersOpenApiObject } from './parameters/generateParametersOpenApiObject'
import { generateContentParametersOpenApiObject } from './parameters-content/generateContentParametersOpenApiObject'

const schemas: [string, () => OpenAPIObject][] = [
  ['generated-schemas/parameters.json', generateParametersOpenApiObject],
  ['generated-schemas/content-parameters.json', generateContentParametersOpenApiObject],
  ['generated-schemas/methods.json', generateHttpMethodsOpenApiObject],
  ['generated-schemas/bodies.json', generateBodiesOpenApiObject],
]

async function generateSchemas() {
  for (const [schemaPath, createSchema] of schemas) {
    await fs.writeFile(resolve(schemaPath), JSON.stringify(createSchema(), null, 2), {
      encoding: 'utf-8',
    })
  }
}

generateSchemas()
