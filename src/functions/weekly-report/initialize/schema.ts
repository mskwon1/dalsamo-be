const schema = {
  type: 'object',
  properties: {
    startDate: { type: 'string' },
  },
  required: ['startDate'],
} as const;

export default schema;
