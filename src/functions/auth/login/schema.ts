const schema = {
  type: 'object',
  properties: {
    credential: { type: 'string' },
  },
  required: ['credential'],
} as const;

export default schema;
