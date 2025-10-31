import api from '../services/api.js';
import { useState } from 'react';
import {
  useQuery,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TablePagination,
  Button,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Switch,
  FormControlLabel,
  Typography,
  MenuItem,
  TableSortLabel,
} from '@mui/material';

function Clients() {
  const [page, setPage] = useState(0); // MUI 0-based
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('clientId');
  const [sortOrder, setSortOrder] = useState('asc');
  const [openCreate, setOpenCreate] = useState(false);

  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    client_key: '',
    client_id: '',
    client_secret: '',
    callback_url: '',
    requires_tenant: false,
    tenant_id: '',
    realm: '',
  });

  const { data, isLoading } = useQuery({
    queryKey: ['clients', page, rowsPerPage, search, sortBy, sortOrder],
    queryFn: () =>
      api
        .get('/clients', {
          params: {
            page: page + 1, // 1-based on backend
            limit: rowsPerPage,
            search,
            sortBy,
            sortOrder,
          },
        })
        .then((res) => res.data),
    keepPreviousData: true,
  });

  const { data: realms } = useQuery({
    queryKey: ['realms'],
    queryFn: () => api.get('/realms').then((res) => res.data),
  });

  const createMutation = useMutation({
    mutationFn: (data) => api.post('/clients', data),
    onSuccess: () => {
      queryClient.invalidateQueries(['clients']);
      alert('Client created');
      setOpenCreate(false);
    },
  });

  const handleSort = (column) => {
    if (sortBy === column) {
      setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortBy(column);
      setSortOrder('asc');
    }
  };

  return (
    <div>
      <Typography variant="h4" gutterBottom>
        Clients
      </Typography>

      <TextField
        label="Search"
        variant="outlined"
        fullWidth
        size="small"
        value={search}
        onChange={(e) => {
          setSearch(e.target.value);
          setPage(0);
        }}
        style={{ marginBottom: '1rem' }}
      />

      <Button variant="contained" onClick={() => setOpenCreate(true)}>
        Create Client
      </Button>

      {isLoading ? (
        <CircularProgress />
      ) : (
        <>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>
                  <TableSortLabel
                    active={sortBy === 'name'}
                    direction={sortBy === 'name' ? sortOrder : 'asc'}
                    onClick={() => handleSort('name')}
                  >
                    Client Name
                  </TableSortLabel>
                </TableCell>
                <TableCell>
                  <TableSortLabel
                    active={sortBy === 'clientId'}
                    direction={sortBy === 'clientId' ? sortOrder : 'asc'}
                    onClick={() => handleSort('clientId')}
                  >
                    Client ID
                  </TableSortLabel>
                </TableCell>
                <TableCell>Realm</TableCell>
                <TableCell>Tenant ID</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data?.rows?.map((client) => (
                <TableRow key={client.clientId}>
                  <TableCell>{client.name}</TableCell>
                  <TableCell>{client.clientId}</TableCell>
                  <TableCell>{client.realm}</TableCell>
                  <TableCell>{client.tenant_id || '-'}</TableCell>
                </TableRow>
              ))}
              {data?.rows?.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} align="center">
                    No clients found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>

          <TablePagination
            component="div"
            count={data?.count || 0}
            page={page}
            onPageChange={(e, newPage) => setPage(newPage)}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={(e) => {
              setRowsPerPage(parseInt(e.target.value, 10));
              setPage(0);
            }}
            rowsPerPageOptions={[5, 10, 25, 50]}
          />
        </>
      )}

      {/* Create Dialog */}
      <Dialog open={openCreate} onClose={() => setOpenCreate(false)}>
        <DialogTitle>Create Client</DialogTitle>
        <DialogContent>
          <TextField
            label="Client Key"
            fullWidth
            margin="normal"
            value={formData.client_key}
            onChange={(e) =>
              setFormData({ ...formData, client_key: e.target.value })
            }
          />
          <TextField
            label="Client ID"
            fullWidth
            margin="normal"
            value={formData.client_id}
            onChange={(e) =>
              setFormData({ ...formData, client_id: e.target.value })
            }
          />
          <TextField
            label="Client Secret"
            fullWidth
            margin="normal"
            value={formData.client_secret}
            onChange={(e) =>
              setFormData({ ...formData, client_secret: e.target.value })
            }
          />
          <TextField
            label="Callback URL"
            fullWidth
            margin="normal"
            value={formData.callback_url}
            onChange={(e) =>
              setFormData({ ...formData, callback_url: e.target.value })
            }
          />
          <TextField
            label="Realm"
            name="realm"
            select
            fullWidth
            margin="normal"
            value={formData.realm}
            onChange={(e) =>
              setFormData({ ...formData, realm: e.target.value })
            }
          >
            {realms?.map((realm) => (
              <MenuItem key={realm.realm_name} value={realm.realm_name}>
                {realm.display_name || realm.realm_name}
              </MenuItem>
            ))}
          </TextField>

          <FormControlLabel
            control={
              <Switch
                checked={formData.requires_tenant}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    requires_tenant: e.target.checked,
                  })
                }
              />
            }
            label="Requires Tenant"
          />
          {formData.requires_tenant && (
            <TextField
              label="Tenant ID"
              fullWidth
              margin="normal"
              value={formData.tenant_id}
              onChange={(e) =>
                setFormData({ ...formData, tenant_id: e.target.value })
              }
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenCreate(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={() => createMutation.mutate(formData)}
          >
            Create
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}

export default Clients;
