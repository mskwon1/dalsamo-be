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
          name: { type: 'string' },
          goalDistance: { type: 'number' },
        },
        required: ['userId', 'name', 'goalDistance'],
      },
    },
  },
  required: ['startDate', 'runEntries'],
} as const;

export default schema;
