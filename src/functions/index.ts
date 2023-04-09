import findAllUsers from './user/findAll';
import createUser from './user/create';
import findOneWeeklyReport from './weekly-report/findOne';
import findAllWeeklyReports from './weekly-report/findAll';
import openWeeklyReport from './weekly-report/open';
import closeWeeklyReport from './weekly-report/close';
import analyzeCaptureImage from './utils/analyze-capture-image';
import login from './auth/login';
import getMe from './user/me';

const functions = {
  findAllUsers,
  createUser,
  findOneWeeklyReport,
  findAllWeeklyReports,
  openWeeklyReport,
  closeWeeklyReport,
  analyzeCaptureImage,
  login,
  getMe,
};

export default functions;
