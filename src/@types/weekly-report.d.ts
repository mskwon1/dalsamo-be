type RunEntryEntity = {
  id: string;
  runDistance: number;
  goalDistance: number;
  userId: string;
  userName: string;
};

type WeeklyReportEntity = {
  id: string;
  startDate: string;
  status: 'pending' | 'confirmed';
};

type ComposedWeeklyReportEntity = WeeklyReportEntity & {
  runEntries: RunEntryEntity[];
};
