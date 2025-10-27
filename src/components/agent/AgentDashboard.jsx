// AgentDashboard.jsx
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import {
	Avatar,
	Box,
	Button,
	Card,
	Chip,
	Divider,
	IconButton,
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
import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { getAgentWithObservations } from '../../FirebaseDB/agent';
import { formatTimestamp } from '../../utils/service';
import { useEffect } from 'react';
import Iconify from '../common/iconify/Iconify';

// const mock = {
// 	agent: {
// 		name: 'John Doe',
// 		email: 'john.doe@leadfire.com',
// 		avatar:
// 			'https://i.pravatar.cc/80?img=5', // swap for your asset
// 		id: 'AG001',
// 		joined: '2023-12-15',
// 		status: 'Active',
// 	},
// 	zones: [
// 		{
// 			name: 'Evergreen Office Park - Zone A',
// 			assigned: 'Feb 15, 2025',
// 			radius: '15 km',
// 			issuesCount: 12,
// 			issues: [
// 				{
// 					id: '#2541',
// 					title: 'john.smith@leadfire.com',
// 					date: 'Jan 28, 2025',
// 				},
// 				{
// 					id: '#2541',
// 					title: 'sarah.johnson@leadfire.com',
// 					date: 'Jan 28, 2025',
// 				},
// 			],
// 		},
// 		{
// 			name: 'Downtown Plaza - Zone B',
// 			assigned: 'Jan 10, 2025',
// 			radius: '20 km',
// 			issuesCount: 12,
// 			issues: [],
// 		},
// 	],
// };

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

function ZoneCard({ zone, index }) {
	const hasIssues = zone.observations
		&& zone.observations
			.length > 0;

	console.log('zone', zone);


	return (
		<Paper variant="outlined" sx={{ p: 2, borderRadius: .5 }}>
			<Stack direction="row" alignItems="center" justifyContent="space-between">
				<Box>
					<Typography fontWeight={600}>{zone?.zones[index]?.zone_name}</Typography>
					<Typography variant="body2" color="text.secondary">
						Assigned: {formatTimestamp(zone?.zones[index]?.createdAt)} · Radius: {zone?.zones[index]?.radius_meters}
					</Typography>
				</Box>
				<IssuesMenuButton count={zone.observationsCount} />
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
							{zone.observations
								?.map((i, idx) => (
									<TableRow key={idx} hover>
										<TableCell>{i.id}</TableCell>
										<TableCell>
											<Box>
												{i?.issueType.map((it, i) => (
													<Typography key={`${i.id}-${idx}`} variant="body2">
														{it},
													</Typography>
												))}

											</Box>
										</TableCell>
										<TableCell>{i.createdAt}</TableCell>
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
	const [rowData, setRowData] = useState({})

	const { id } = useParams()

	useEffect(() => {
		if (id) {
			getAgentWithObservations(id).then((companyDetail) => {
				console.log('companyDetail', companyDetail);
				if (companyDetail) {
					setRowData(companyDetail)
				}

				// setInitialData({
				// 	...initialData,
				// 	company_name: companyDetail?.company_name
				// })

			})
		}
	}, [id])

	// console.log('rowData :- ', rowData?.email);



	return (
		<Box>
			<Card variant="outlined" sx={{ p: 2, borderRadius: 0.5, mb: 2 }}>
				<Stack direction="row" alignItems="center" spacing={2} justifyContent="space-between">
					<Stack direction="row" spacing={2} alignItems="center">
						<Avatar src={rowData?.avatar} alt={rowData?.agent_name} sx={{ width: 48, height: 48 }} />
						<Box>
							<Typography fontWeight={700}>{rowData?.agent_name}</Typography>
							<Typography variant="body2" color="text.secondary">
								{rowData.email}
							</Typography>
						</Box>
					</Stack>

					<Box sx={{ textAlign: 'right' }}>
						<Typography variant="body2" color="text.secondary">
							Agent ID : <Typography component="span" color="text.primary"> {rowData?.id}</Typography>
						</Typography>
						<Typography variant="body2" color="text.secondary">
							Date Joined : <Typography component="span" color="text.primary"> {formatTimestamp(rowData?.createdAt)}</Typography>
						</Typography>
					</Box>

					<Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
						{/* <Button
							variant="outlined"
							size="small"
							startIcon={<Iconify icon="iconamoon:edit" />}
							// onClick={() =>}
							sx={{
								borderRadius: 0.5,
								// borderColor: "divider",      // use theme divider color
								textTransform: "none",       // keep normal text
								fontWeight: 500,
								color: 'text.secondary',
							}}
						>
							Edit
						</Button> */}
						<Chip
							color="success"
							variant="outlined"
							size='medium'
							label={rowData?.status == 1 ? 'Active' : 'Inactive'}
							// icon={ }
							// endIcon={< CheckCircleOutlineIcon />}
							sx={{
								borderRadius: 999,
								fontWeight: 600,
							}}
						/>
					</Stack>
				</Stack>
			</Card>


			<Card variant="outlined" sx={{ borderRadius: 0.5, mb: 2 }}>
				<Typography variant="h5" sx={{ px: 1.8, py: 2, mb: 1.5 }}>
					Assigned Zones & Issues
				</Typography>
				<Divider />

				<Stack spacing={2}>
					{rowData?.zones?.map((z, i) => (
						<ZoneCard key={i} zone={rowData} index={i} />
					))}
				</Stack>

			</Card>
		</Box>
	);
}
