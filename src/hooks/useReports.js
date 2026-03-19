import { useState, useCallback } from 'react';
import { createReport, fetchReports } from '../api/reports';

export const useReports = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadReportsByProject = useCallback(async (projectId) => {
    if (!projectId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await fetchReports(projectId);
      setReports(data);
    } catch (err) {
      if (err?.response?.status !== 404) {
        setError(err.message || 'Failed to load reports');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const addReport = async (reportData) => {
    setLoading(true);
    setError(null);
    try {
      const newReport = await createReport(reportData);
      setReports((prev) => [newReport, ...prev]);
      return newReport;
    } catch (err) {
      setError(err.message || 'Failed to submit report');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    reports,
    loading,
    error,
    loadReportsByProject,
    addReport
  };
};
