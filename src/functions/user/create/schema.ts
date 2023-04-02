const schema = {
  type: 'object',
  properties: {
    name: { type: 'string' },
    email: { type: 'string' },
    rundayTag: { type: 'string' },
  },
  required: ['name'],
} as const;

export default schema;
