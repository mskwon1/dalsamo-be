const schema = {
  type: 'object',
  properties: {
    startDate: { type: 'string' },
    runEntries: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          userId: { type: 'string' },
          goalDistance: { type: 'number' },
        },
        required: ['userId', 'goalDistance'],
      },
    },
  },
  required: ['startDate', 'runEntries'],
} as const;

export default schema;
