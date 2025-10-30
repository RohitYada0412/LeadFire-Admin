// AgentDashboard.jsx
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import {
	Avatar,
	Box,
	Button,
	Card,
	Chip,
	Divider,
	ListItemIcon,
	ListItemText,
	Menu,
	MenuItem,
	Paper,
	Stack,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
	Typography
} from '@mui/material';
import * as React from 'react';

const mock = {
	agent: {
		name: 'John Doe',
		email: 'john.doe@leadfire.com',
		avatar:
			'https://i.pravatar.cc/80?img=5', // swap for your asset
		id: 'AG001',
		joined: '2023-12-15',
		status: 'Active',
	},
	zones: [
		{
			name: 'Evergreen Office Park - Zone A',
			assigned: 'Feb 15, 2025',
			radius: '15 km',
			issuesCount: 12,
			issues: [
				{
					id: '#2541',
					title: 'john.smith@leadfire.com',
					date: 'Jan 28, 2025',
				},
				{
					id: '#2541',
					title: 'sarah.johnson@leadfire.com',
					date: 'Jan 28, 2025',
				},
			],
		},
		{
			name: 'Downtown Plaza - Zone B',
			assigned: 'Jan 10, 2025',
			radius: '20 km',
			issuesCount: 12,
			issues: [],
		},
	],
};

function IssuesMenuButton({ count = 0 }) {
	const [anchorEl, setAnchorEl] = React.useState(null);
	const open = Boolean(anchorEl);
	return (
		<>
			<Button
				variant="outlined"
				size="small"
				endIcon={<KeyboardArrowDownIcon />}
				onClick={(e) => setAnchorEl(e.currentTarget)}
				sx={{ borderRadius: 999, textTransform: 'none' }}
			>
				{count} Issues
			</Button>
			<Menu
				anchorEl={anchorEl}
				open={open}
				onClose={() => setAnchorEl(null)}
				anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
				transformOrigin={{ vertical: 'top', horizontal: 'right' }}
			>
				<MenuItem onClick={() => setAnchorEl(null)}>
					<ListItemIcon>
						<VisibilityOutlinedIcon fontSize="small" />
					</ListItemIcon>
					<ListItemText>View All Issues</ListItemText>
				</MenuItem>
				<MenuItem onClick={() => setAnchorEl(null)}>
					<ListItemText>Open</ListItemText>
				</MenuItem>
				<MenuItem onClick={() => setAnchorEl(null)}>
					<ListItemText>Resolved</ListItemText>
				</MenuItem>
			</Menu>
		</>
	);
}

function ZoneCard({ zone }) {
	const hasIssues = zone.issues && zone.issues.length > 0;

	return (
		<Paper variant="outlined" sx={{ p: 2, borderRadius: .5 }}>
			<Stack direction="row" alignItems="center" justifyContent="space-between">
				<Box>
					<Typography fontWeight={600}>{zone.name}</Typography>
					<Typography variant="body2" color="text.secondary">
						Assigned: {zone.assigned} · Radius: {zone.radius}
					</Typography>
				</Box>
				<IssuesMenuButton count={zone.issuesCount} />
			</Stack>

			{hasIssues && (
				<TableContainer component={Box} sx={{ mt: 2, borderRadius: 1 }}>
					<Table size="small" aria-label="issues table">
						<TableHead>
							<TableRow sx={{ backgroundColor: (t) => t.palette.error.light + '22' }}>
								<TableCell sx={{ fontWeight: 600 }}>Issue ID</TableCell>
								<TableCell sx={{ fontWeight: 600 }}>Title</TableCell>
								<TableCell sx={{ fontWeight: 600 }}>Date</TableCell>
								<TableCell align="right" sx={{ fontWeight: 600 }}>
									Actions
								</TableCell>
							</TableRow>
						</TableHead>
						<TableBody>
							{zone.issues.map((i, idx) => (
								<TableRow key={idx} hover>
									<TableCell>{i.id}</TableCell>
									<TableCell>{i.title}</TableCell>
									<TableCell>{i.date}</TableCell>
									<TableCell align="right">
										<Button
											size="small"
											variant="contained"
											disableElevation
											endIcon={<VisibilityOutlinedIcon />}
											sx={{
												textTransform: 'none',
												borderRadius: 999,
												bgcolor: (t) => t.palette.error.main,
												'&:hover': { bgcolor: (t) => t.palette.error.dark },
											}}
										>
											View Detail
										</Button>
									</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
				</TableContainer>
			)}
		</Paper>
	);
}

export default function AgentDashboard() {
	const { agent, zones } = mock;

	return (
		<Box>
			<Card variant="outlined" sx={{ p: 2, borderRadius: 0.5, mb: 2 }}>
				<Stack direction="row" alignItems="center" spacing={2} justifyContent="space-between">
					<Stack direction="row" spacing={2} alignItems="center">
						<Avatar src={agent.avatar} alt={agent.name} sx={{ width: 48, height: 48 }} />
						<Box>
							<Typography fontWeight={700}>{agent.name}</Typography>
							<Typography variant="body2" color="text.secondary">
								{agent.email}
							</Typography>
						</Box>
					</Stack>

					<Box sx={{ textAlign: 'right' }}>
						<Typography variant="body2" color="text.secondary">
							Agent ID : <Typography component="span" color="text.primary"> {agent.id}</Typography>
						</Typography>
						<Typography variant="body2" color="text.secondary">
							Date Added : <Typography component="span" color="text.primary"> {agent.joined}</Typography>
						</Typography>
					</Box>

					<Chip
						color="success"
						variant="outlined"
						icon={<CheckCircleOutlineIcon />}
						label={agent.status}
						sx={{
							borderRadius: 999,
							fontWeight: 600,
						}}
					/>
				</Stack>
			</Card>


			<Card variant="outlined" sx={{ borderRadius: 0.5, mb: 2 }}>
				<Typography variant="h5" sx={{ px:1.8,py:2, mb: 1.5 }}>
					Assigned Zones & Issues
				</Typography>
				<Divider />

				<Stack spacing={2}>
					{zones.map((z, i) => (
						<ZoneCard key={i} zone={z} />
					))}
				</Stack>

			</Card>
		</Box>
	);
}
