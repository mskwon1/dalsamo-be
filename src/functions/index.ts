import findAllUsers from './user/findAll';
import createUser from './user/create';
import findOneWeeklyReport from './weekly-report/findOne';
import findAllWeeklyReports from './weekly-report/findAll';
import createWeeklyReport from './weekly-report/create';
import closeWeeklyReport from './weekly-report/close';
import analyzeCaptureImage from './utils/analyze-capture-image';

const functions = {
  findAllUsers,
  createUser,
  findOneWeeklyReport,
  findAllWeeklyReports,
  createWeeklyReport,
  closeWeeklyReport,
  analyzeCaptureImage,
};

export default functions;
