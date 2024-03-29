type RunEntryEntity = {
  id: string;
  weeklyReportId: string;
  runDistance: number;
  goalDistance: number;
  userId: string;
  userName: string;
  imageUrls: string[];
  season: string;
};

type WeeklyReportEntity = {
  id: string;
  startDate: string;
  status: 'pending' | 'confirmed';
  reportImageUrl: string | null;
  season: string;
};

type ComposedWeeklyReportEntity = WeeklyReportEntity & {
  runEntries: RunEntryEntity[];
  fines: FineEntity[];
};
