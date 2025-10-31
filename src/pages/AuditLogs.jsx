import { Typography } from '@mui/material';
import AuditLogTable from '../components/AuditLogTable.jsx';

function AuditLogs() {
  return (
    <div>
      <Typography variant="h4" gutterBottom>
        Audit Logs
      </Typography>
      <AuditLogTable />
    </div>
  );
}

export default AuditLogs;