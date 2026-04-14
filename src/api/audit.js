import api from './index';

/**
 * Fetch paginated audit logs for the current user.
 */
export const fetchAuditLogs = async ({ page = 1, limit = 50 } = {}) => {
    return api.get('/audits', { params: { page, limit } });
};
