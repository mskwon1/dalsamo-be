const schema = {
  type: 'object',
  properties: {
    startDate: { type: 'string' },
    season: { type: 'string' },
    runEntries: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          userId: { type: 'string' },
          userName: { type: 'string' },
          goalDistance: { type: 'number' },
        },
        required: ['userId', 'userName', 'goalDistance'],
      },
    },
  },
  required: ['startDate', 'season', 'runEntries'],
} as const;

export default schema;
