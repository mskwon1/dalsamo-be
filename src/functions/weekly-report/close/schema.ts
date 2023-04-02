const schema = {
  type: 'object',
  properties: {
    runEntries: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          runDistance: { type: 'number' },
          goalDistance: { type: 'number' },
          userId: { type: 'string' },
          userName: { type: 'string' },
        },
        required: ['id', 'runDistance', 'goalDistance', 'userId', 'userName'],
      },
    },
  },
  required: ['runEntries'],
} as const;

export default schema;
