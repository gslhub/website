import type { ImportMap } from 'payload';

import DevelopmentResetActions from '../../../components/admin/DevelopmentResetActions';
import GSLHubAdminIcon from '../../../components/admin/GSLHubAdminIcon';
import GSLHubAdminLogo from '../../../components/admin/GSLHubAdminLogo';
import LogoutButton from '../../../components/admin/LogoutButton';
import ResearchDashboard from '../../../components/admin/ResearchDashboard';
import TestDataBatchActions from '../../../components/admin/TestDataBatchActions';

export const importMap: ImportMap = {
  '/components/admin/DevelopmentResetActions#default': DevelopmentResetActions,
  '/components/admin/GSLHubAdminIcon#default': GSLHubAdminIcon,
  '/components/admin/GSLHubAdminLogo#default': GSLHubAdminLogo,
  '/components/admin/LogoutButton#default': LogoutButton,
  '/components/admin/ResearchDashboard#default': ResearchDashboard,
  '/components/admin/TestDataBatchActions#default': TestDataBatchActions,
};
