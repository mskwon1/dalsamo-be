type RunEntryEntity = {
  id: string;
  runDistance: number;
  goalDistance: number;
  userId: string;
  name: string;
};

type WeeklyReportEntity = {
  id: string;
  startDate: string;
  status: 'pending' | 'confirmed';
};

type ComposedWeeklyReportEntity = WeeklyReportEntity & {
  runEntries: RunEntryEntity[];
};
