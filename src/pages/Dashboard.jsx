import {
  Box,
  Card,
  Grid2 as Grid,
  Stack,
  Typography,
  IconButton
} from '@mui/material';

import AdminOverview from '../components/charts/AdminOverview';
import TabelComponent from '../components/common/Tabel';
import { agents } from '../utils/service';
import { companyEmailExists } from '../FirebaseDB/auth';

const StatCard = ({ label, value, actionIcon }) => (
  <Card
    variant='outlined'
    sx={{
      display: "flex",
      flexDirection: "column",
      height: "100%",
      px: 1.5,
      py: 1
    }}>
    <Stack direction="row" alignItems="center" spacing={1.5}>
      <Box sx={{ flexGrow: 1 }}>
        <Typography variant="h6">{label}</Typography>
        <Typography variant="h5">{value}</Typography>
      </Box>
      {actionIcon && (
        <IconButton size="small" sx={{ bgcolor: "#391c1cff", borderRadius: 1.2 }}>
          {actionIcon}
        </IconButton>
      )}
    </Stack>
  </Card>
);

export default function Dashboard() {

  const { role } = JSON.parse(sessionStorage.getItem("auth"));

  // ----------------- COMPANY VIEW -------------------
  if (role === "company") {




    return (
      <Stack spacing={3} sx={{ p: 3 }}>


        <Stack
          spacing={2}
          sx={{
            bgcolor: "#f5f5f5",
            border: "1px solid #ddd",
            borderRadius: 2,
            p: 3,
            // maxWidth: 600,
          }}
        >
          <Typography variant="subtitle1" fontWeight="600">
            Dashboard metrics and analytics are coming soon.
          </Typography>

          <Typography variant="body2">
            Stay tuned for new insights and activity views.
          </Typography>

          <Typography variant="subtitle2" fontWeight="600">Instructions:</Typography>

          <Stack component="ol" spacing={1} sx={{ pl: 2 }}>
            <Typography component="li" variant="body2">
              Go to <strong>Manage My Agents</strong> to add new field agents.
            </Typography>
            <Typography component="li" variant="body2">
              Select <strong>Manage Zones</strong> to set service areas.
            </Typography>
            <Typography component="li" variant="body2">
              Click <strong>Logout</strong> to securely exit the portal.
            </Typography>
          </Stack>
        </Stack>
      </Stack>
    );
  }

  // ----------------- ADMIN VIEW -------------------
  return (
    <Box SX={{ backgroundColor: '#FFF' }}>
      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid size={{ xs: 12, md: 3 }}>
          <StatCard label="Total Agents" value={250} />
        </Grid>
        <Grid size={{ xs: 12, md: 3 }}>
          <StatCard label="Total Issues" value={250} />
        </Grid>
      </Grid>

      <AdminOverview />

      <TabelComponent data={agents} title='Recent Agent' />
      <TabelComponent data={agents} title='Recent Issues' />
    </Box>
  );
}
