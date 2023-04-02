import findAllUsers from './user/findAll';
import createUser from './user/create';
import findOneWeeklyReport from './weekly-report/findOne';
import findAllWeeklyReports from './weekly-report/findAll';
import createWeeklyReport from './weekly-report/create';

const functions = {
  findAllUsers,
  createUser,
  findOneWeeklyReport,
  findAllWeeklyReports,
  createWeeklyReport,
};

export default functions;
