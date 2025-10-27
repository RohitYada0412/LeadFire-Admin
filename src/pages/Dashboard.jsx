// src/pages/Dashboard.jsx
import {
  Box,
  Card,
  Grid2 as Grid,
  Stack,
  Typography
} from '@mui/material';
import AdminOverview from '../components/charts/AdminOverview';
import TabelComponent from '../components/common/Tabel';
import { agents } from '../utils/service';



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
        <Typography variant="h6">
          {label}
        </Typography>
        <Typography variant="h5">
          {value}
        </Typography>
      </Box>
      {actionIcon ? (
        <IconButton size="small" sx={{ bgcolor: "#251c39", borderRadius: 1.2 }}>
          {actionIcon}
        </IconButton>
      ) : null}
    </Stack>
  </Card>
);

export default function Dashboard() {


  return (
    <Box SX={{ backgroundColor: '#FFF' }}>
      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid size={{ xs: 12, md: 3 }}>
          <StatCard
            label="Total Zones"
            value={250}
            icon={''}
            actionIcon={''}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 3 }}>
          <StatCard
            label="Total Agents"
            value={250}
            icon={''}
            actionIcon={''}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 3 }}>
          <StatCard
            label="Total Issues"
            value={250}
            icon={''}
            actionIcon={''}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 3 }}>
          <StatCard
            label="Open Issue"
            value={250}
            icon={''}
            actionIcon={''}
          />
        </Grid>
      </Grid>
      <AdminOverview />

      <TabelComponent data={agents} title='Recent Agent' />
      <TabelComponent data={agents} title='Recent Issues' />


    </Box>
  )
}
