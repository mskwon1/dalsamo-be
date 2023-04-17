const schema = {
  type: 'object',
  properties: {
    weeklyReportId: { type: 'string' },
    runDistance: { type: 'number' },
    imageUrls: { type: 'array', items: { type: 'string' } },
  },
  required: ['weeklyReportId'],
} as const;

export default schema;
