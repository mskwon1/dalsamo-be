const schema = {
  type: 'object',
  properties: {
    name: { type: 'string' },
    email: { type: 'string' },
  },
  required: ['name'],
} as const;

export default schema;
