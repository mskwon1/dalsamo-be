const schema = {
  type: 'object',
  properties: {
    weeklyReportId: { type: 'string' },
    userId: { type: 'string' },
    userName: { type: 'string' },
    value: { type: 'number' },
  },
  required: ['userId', 'userName', 'value'],
} as const;

export default schema;
