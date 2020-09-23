import React from 'react'
import RangeSlider from 'unitx-ui/components/RangeSlider'
export const FILTER_SCHEMA = {
  schema: {
    title: 'Filter',
    type: 'object',
    required: [
      // 'inDegree',
      'degree',
      // 'rechtsgebied',
      // 'adjustLayout',
    ],
    additionalProperties: false,
    extendTypeAnnotation: '',
    extendAnnotation: '',
    extendProperties: {},
    properties: {
      'in_degree': {
        type: 'array',
        items: {
          type: 'number',
        },
        minimum: 0,
        maximum: 6,
      },
      degree: {
        title: 'degree',
        type: 'number',
        extendTypeAnnotation: '',
        extendAnnotation: '{min: 0, max: 6}',
        minimum: 0,
        maximum: 6,
        extendProperties: {
          min: 0,
          max: 6,
        },
      },
      rechtsgebied: {
        title: 'civielRecht',
        type: 'string',
        enum: [
          'civielRecht',
        ],
        extendTypeAnnotation: '',
        extendAnnotation: '',
        extendProperties: {},
      },
      // adjustLayout: {
      //   title: 'boolean',
      //   type: 'boolean',
      //   extendTypeAnnotation: '',
      //   extendAnnotation: '',
      //   extendProperties: {},
      // },
    },
  },
  uiSchema: {
    'in_degree': {
      'ui:field': ({ formData, schema, onChange}) => {
        return (
          <RangeSlider
            style={{ width: '90%', height: 100 }}
            min={schema.minimum}
            max={schema.maximum}
            value={formData}
            onValueChange={onChange}
          />
        )
      },
    },
  }
}
export const SECOND_FILTER_SCHEMA = {
  schema: {
    title: 'Filter',
    type: 'object',
    required: [
      // 'title',
      // 'year',
      // 'rechtsgebied',
      // 'adjustLayout',
    ],
    additionalProperties: false,
    extendTypeAnnotation: '',
    extendAnnotation: '',
    extendProperties: {},
    properties: {
      title: {
        type: 'string',
      },
      year: {
        type: 'array',
        items: {
          type: 'number',
        },
        minimum: 1969,
        maximum: 2015,
      },
      live: {
        title: 'boolean',
        type: 'boolean',
        extendTypeAnnotation: '',
        extendAnnotation: '',
        extendProperties: {},
      },
    },
  },
  uiSchema: {
    'year': {
      'ui:field': ({ formData, schema, onChange}) => {
        return (
          <RangeSlider
            style={{ width: '90%', height: 100 }}
            min={schema.minimum}
            max={schema.maximum}
            value={formData}
            onValueChange={onChange}
          />
        )
      },
    },
  }
}
// export FILTER_SCHEMA = {}