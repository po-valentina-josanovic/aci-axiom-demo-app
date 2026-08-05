// Mock data for the Audit Tracker demo. In production this is served by the
// real audit table (Info tab) and Elmah (Errors tab). Each row's `page` /
// `section` and `event` values are drawn from the real AuditTrackerHelper /
// AuditTrackerMessageHelper constants so the filters above operate on the
// same vocabulary the production system actually uses.

export const USERNAME_OPTIONS = [
  'Marija Miletic',
  'Valentina Josanovic',
  'John Doe',
  'Jimmy.Cabrera@acibuilds.com',
];

function area(page, section) {
  return section ? `${page} > ${section}` : page;
}

export const AUDIT_LOG = [
  { id: 1, date: '08/05/2026 08:54:45', username: 'Marija Miletic', event: 'Save Potential Project', page: 'Potential Projects', section: 'Project Overview', area: area('Potential Projects', 'Project Overview'), jobNumber: 'N/A', jobName: 'N/A', additionalInfo: 'Project:26-010z01-MM', field: 'ProjectStatusId', oldValue: '5', newValue: '6' },
  { id: 2, date: '08/05/2026 07:54:41', username: 'Marija Miletic', event: 'Save Potential Project', page: 'Potential Projects', section: 'Estimator Trades', area: area('Potential Projects', 'Estimator Trades'), jobNumber: 'N/A', jobName: 'N/A', additionalInfo: 'Project:26-010z01-MM', field: 'Carlos Abarca Iraheta - PIPESHOP', oldValue: 'Hours:1111.0000 Dollars:1111.0000', newValue: 'Hours:100000.0000 Dollars:100000.0000' },
  { id: 3, date: '08/05/2026 07:54:41', username: 'Marija Miletic', event: 'Save Potential Project', page: 'Potential Projects', section: 'Estimator Trades', area: area('Potential Projects', 'Estimator Trades'), jobNumber: 'N/A', jobName: 'N/A', additionalInfo: 'Project:26-010z01-MM', field: 'Angel Abarca - ELEC', oldValue: 'Hours:1111.0000 Dollars:1111.0000', newValue: 'Hours:10000.0000 Dollars:1000.0000' },
  { id: 4, date: '08/04/2026 16:12:09', username: 'Valentina Josanovic', event: 'Create Potential Project', page: 'Potential Projects', section: 'Project Overview', area: area('Potential Projects', 'Project Overview'), jobNumber: 'N/A', jobName: 'N/A', additionalInfo: 'Project:26-010z02-VJ', field: 'ProjectName', oldValue: '', newValue: 'Riverside Medical Center' },
  { id: 5, date: '08/04/2026 15:48:22', username: 'John Doe', event: 'Save Potential Project', page: 'Potential Projects', section: 'Contract Details', area: area('Potential Projects', 'Contract Details'), jobNumber: 'N/A', jobName: 'N/A', additionalInfo: 'Project:26-009z14-JD', field: 'ContractType', oldValue: 'Lump Sum', newValue: 'GMP' },
  { id: 6, date: '08/04/2026 14:20:03', username: 'Marija Miletic', event: 'Save Potential Project', page: 'Potential Projects', section: 'Contacts', area: area('Potential Projects', 'Contacts'), jobNumber: 'N/A', jobName: 'N/A', additionalInfo: 'Project:26-010z01-MM', field: 'ContactRole', oldValue: '', newValue: 'Client - Sarah Nguyen' },
  { id: 7, date: '08/04/2026 11:05:57', username: 'Valentina Josanovic', event: 'Save Potential Project', page: 'Potential Projects', section: 'Contract Summary', area: area('Potential Projects', 'Contract Summary'), jobNumber: 'N/A', jobName: 'N/A', additionalInfo: 'Project:26-010z02-VJ', field: 'EstimationNumber', oldValue: '', newValue: '245000.00' },
  { id: 8, date: '08/03/2026 17:33:14', username: 'John Doe', event: 'Update Project Stage', page: 'Potential Projects', section: 'Project Overview', area: area('Potential Projects', 'Project Overview'), jobNumber: 'N/A', jobName: 'N/A', additionalInfo: 'Project:26-009z14-JD', field: 'ProjectStage', oldValue: 'Budget', newValue: 'Bid' },
  { id: 9, date: '08/03/2026 10:41:29', username: 'Marija Miletic', event: 'Save Potential Project', page: 'Potential Projects', section: 'Award Details', area: area('Potential Projects', 'Award Details'), jobNumber: 'N/A', jobName: 'N/A', additionalInfo: 'Project:26-010z00-MM', field: 'ProjectManager', oldValue: '', newValue: 'Carlos Abarca Iraheta' },
  { id: 10, date: '08/02/2026 09:15:02', username: 'Valentina Josanovic', event: 'Save Potential Project', page: 'Potential Projects', section: 'Contacts', area: area('Potential Projects', 'Contacts'), jobNumber: 'N/A', jobName: 'N/A', additionalInfo: 'Project:26-010z02-VJ', field: 'ContactRole', oldValue: 'Engineer - Tom Reyes', newValue: '' },
  { id: 11, date: '08/01/2026 19:02:47', username: 'John Doe', event: 'Save Potential Project', page: 'Potential Projects', section: 'Loss Details', area: area('Potential Projects', 'Loss Details'), jobNumber: 'N/A', jobName: 'N/A', additionalInfo: 'Project:26-008z21-JD', field: 'LostFeedback', oldValue: '', newValue: 'Client selected lower bid from competitor.' },
  { id: 12, date: '08/01/2026 13:27:36', username: 'Marija Miletic', event: 'Save Potential Project', page: 'Potential Projects', section: 'Estimator Trades', area: area('Potential Projects', 'Estimator Trades'), jobNumber: 'N/A', jobName: 'N/A', additionalInfo: 'Project:26-010z01-MM', field: 'Angel Abarca - HVAC', oldValue: 'Hours:800.0000 Dollars:80000.0000', newValue: 'Hours:950.0000 Dollars:95000.0000' },
  { id: 13, date: '07/31/2026 08:44:11', username: 'Valentina Josanovic', event: 'Add New User', page: 'User Management', section: 'User List', area: area('User Management', 'User List'), jobNumber: 'N/A', jobName: 'N/A', additionalInfo: 'N/A', field: 'Username', oldValue: '', newValue: 'kmurphy' },
  { id: 14, date: '07/30/2026 16:59:52', username: 'John Doe', event: 'Create Contact', page: 'Company and Contact Management', section: 'Contact', area: area('Company and Contact Management', 'Contact'), jobNumber: 'N/A', jobName: 'N/A', additionalInfo: 'N/A', field: 'Email', oldValue: '', newValue: 's.nguyen@clientco.com' },
  { id: 15, date: '07/29/2026 12:03:58', username: 'Marija Miletic', event: 'Save Potential Project', page: 'Potential Projects', section: 'Site Location', area: area('Potential Projects', 'Site Location'), jobNumber: 'N/A', jobName: 'N/A', additionalInfo: 'Project:26-010z01-MM', field: 'Street', oldValue: '400 Harbor Blvd', newValue: '410 Harbor Blvd' },
  { id: 16, date: '07/28/2026 09:18:40', username: 'Valentina Josanovic', event: 'Save Potential Project', page: 'Potential Projects', section: 'Project Overview', area: area('Potential Projects', 'Project Overview'), jobNumber: 'N/A', jobName: 'N/A', additionalInfo: 'Project:26-010z02-VJ', field: 'Probability%', oldValue: '40', newValue: '65' },
  { id: 17, date: '07/25/2026 15:36:21', username: 'John Doe', event: 'Update Project Stage', page: 'Potential Projects', section: 'Project Overview', area: area('Potential Projects', 'Project Overview'), jobNumber: 'N/A', jobName: 'N/A', additionalInfo: 'Project:26-009z14-JD', field: 'ProjectStage', oldValue: 'Bid', newValue: 'Award' },
  { id: 18, date: '07/24/2026 10:52:07', username: 'Marija Miletic', event: 'Save Potential Project', page: 'Potential Projects', section: 'Contract Summary', area: area('Potential Projects', 'Contract Summary'), jobNumber: 'N/A', jobName: 'N/A', additionalInfo: 'Project:26-010z01-MM', field: 'EstimationNumber', oldValue: '180000.00', newValue: '212500.00' },
  { id: 19, date: '07/22/2026 14:11:03', username: 'John Doe', event: 'Update Manpower', page: 'Jobs', section: 'Manpower', area: area('Jobs', 'Manpower'), jobNumber: '26-010z00', jobName: 'Harbor Point Expansion', additionalInfo: 'N/A', field: 'Hours', oldValue: '400', newValue: '525' },
  { id: 20, date: '07/21/2026 08:37:19', username: 'Marija Miletic', event: 'Add Cost Code', page: 'Jobs', section: 'Job Setup', area: area('Jobs', 'Job Setup'), jobNumber: '26-009z14', jobName: 'Coastal Logistics Warehouse', additionalInfo: 'N/A', field: 'CostCode', oldValue: '', newValue: '03-100-ELEC' },
  { id: 21, date: '07/19/2026 18:22:51', username: 'Valentina Josanovic', event: 'Add Bid Summary', page: 'Bid Summary Warehouse', section: 'Bid Summary', area: area('Bid Summary Warehouse', 'Bid Summary'), jobNumber: 'N/A', jobName: 'N/A', additionalInfo: 'N/A', field: 'BidSummaryId', oldValue: '', newValue: 'BSW-2026-0412' },
  { id: 22, date: '07/18/2026 09:05:44', username: 'John Doe', event: 'Update Baseline', page: 'Master Manpower', section: 'PreCon', area: area('Master Manpower', 'PreCon'), jobNumber: '26-010z00', jobName: 'Harbor Point Expansion', additionalInfo: 'N/A', field: 'BaselineHours', oldValue: '1200', newValue: '1350' },
  { id: 23, date: '07/16/2026 13:48:02', username: 'Marija Miletic', event: 'Edit Job Departments', page: 'Global Configuration', section: 'Job Departments', area: area('Global Configuration', 'Job Departments'), jobNumber: 'N/A', jobName: 'N/A', additionalInfo: 'N/A', field: 'DepartmentName', oldValue: '010D - DSM', newValue: '010D - Distribution Services' },
];

export const ERROR_LOG = [
  { id: 1, date: '08/03/2026 20:27:21', user: 'Jimmy.Cabrera@acibuilds.com', url: '/Dashboard/Jobs/GetProjectsData', method: 'POST', code: 500, type: 'System.Exception', message: 'Unexpected end of request content.' },
  { id: 2, date: '08/03/2026 15:02:32', user: 'Jimmy.Cabrera@acibuilds.com', url: '/Dashboard/Jobs/GetProjectsData', method: 'POST', code: 500, type: 'System.Exception', message: 'Unexpected end of request content.' },
  { id: 3, date: '08/03/2026 13:08:35', user: 'Jimmy.Cabrera@acibuilds.com', url: '/Dashboard/Jobs/GetProjectsData', method: 'POST', code: 500, type: 'System.Exception', message: 'Unexpected end of request content.' },
  { id: 4, date: '07/30/2026 17:55:25', user: 'Jimmy.Cabrera@acibuilds.com', url: '/Dashboard/Jobs/GetProjectsData', method: 'POST', code: 500, type: 'System.Exception', message: 'Unexpected end of request content.' },
  { id: 5, date: '07/23/2026 15:36:37', user: 'Jimmy.Cabrera@acibuilds.com', url: '/Dashboard/Jobs/GetProjectsData', method: 'POST', code: 500, type: 'System.Exception', message: 'Unexpected end of request content.' },
  { id: 6, date: '07/20/2026 19:52:06', user: 'Jimmy.Cabrera@acibuilds.com', url: '/Dashboard/Jobs/GetProjectsData', method: 'POST', code: 500, type: 'System.Exception', message: 'Unexpected end of request content.' },
  { id: 7, date: '07/09/2026 19:45:26', user: 'Jimmy.Cabrera@acibuilds.com', url: '/Dashboard/Jobs/GetProjectsData', method: 'POST', code: 500, type: 'System.Exception', message: 'Unexpected end of request content.' },
  { id: 8, date: '08/02/2026 11:14:09', user: 'Marija Miletic', url: '/Dashboard/PotentialProjects/Save', method: 'POST', code: 400, type: 'System.ArgumentException', message: 'ProjectStatusId is required.' },
  { id: 9, date: '07/28/2026 09:02:51', user: 'Valentina Josanovic', url: '/Dashboard/ClientContacts/GetContacts', method: 'GET', code: 404, type: 'System.Web.HttpException', message: 'Resource not found.' },
  { id: 10, date: '07/22/2026 14:38:17', user: 'John Doe', url: '/Dashboard/Jobs/GetManpowerData', method: 'GET', code: 500, type: 'System.NullReferenceException', message: 'Object reference not set to an instance of an object.' },
];
