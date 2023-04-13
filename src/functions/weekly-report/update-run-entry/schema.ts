const schema = {
  type: 'object',
  properties: {
    runDistance: { type: 'number' },
    imageUrls: { type: 'array', items: { type: 'string' } },
  },
  required: [],
} as const;

export default schema;
