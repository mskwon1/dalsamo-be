import findAllUsers from './user/findAll';
import createUser from './user/create';
import findOneWeeklyReport from './weekly-report/findOne';
import findAllWeeklyReports from './weekly-report/findAll';
import openWeeklyReport from './weekly-report/open';
import closeWeeklyReport from './weekly-report/close';
import analyzeCaptureImage from './utils/analyze-capture-image';
import login from './auth/login';
import getMe from './user/me';
import createFine from './fine/create';
import uploadRunEntryImage from './utils/upload-run-entry-image';
import updateRunEntry from './weekly-report/update-run-entry';

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
  createFine,
  uploadRunEntryImage,
  updateRunEntry,
};

export default functions;
