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

function IssuesMenuButton({ count = 0 }) {
	const [anchorEl, setAnchorEl] = React.useState(null);
	const open = Boolean(anchorEl);
	return (
		<>
			<Button
				variant="outlined"
				size="small"
				onClick={(e) => setAnchorEl(e.currentTarget)}
				sx={{ borderRadius: 0.8, textTransform: 'none' }}
			>
				{count} Issues
			</Button>
		</>
	);
}

function ZoneCard({ zone, index }) {
	// current zone object
	const currentZone = zone?.zones?.[index];
	const zoneId = currentZone?.id || currentZone?.zone_id;

	// only observations belonging to this zone
	const observationsForZone = (zone?.observations ?? []).filter(
		(o) => (o.zoneId || o.zone_id) === zoneId
	);

	const hasIssues = observationsForZone.length > 0;

	return (
		<Paper variant="outlined" sx={{ p: 2, borderRadius: 0.5 }}>
			<Stack direction="row" alignItems="center" justifyContent="space-between">
				<Box>
					<Typography fontWeight={600}>{currentZone?.zone_name}</Typography>
				</Box>

				<IssuesMenuButton count={observationsForZone.length} />
			</Stack>

			{hasIssues && (
				<TableContainer component={Box} sx={{ mt: 2, borderRadius: 1 }}>
					<Table size="small" aria-label="issues table">
						<TableHead>
							<TableRow sx={{ backgroundColor: (t) => t.palette.error.light + "22" }}>
								<TableCell sx={{ fontWeight: 600 }}>Lead Address</TableCell>
								<TableCell sx={{ fontWeight: 600 }}>Issues Captured</TableCell>
								<TableCell sx={{ fontWeight: 600 }}>Date</TableCell>
							</TableRow>
						</TableHead>
						<TableBody>
							{observationsForZone.map((obs) => (
								<TableRow key={obs.id} hover>
									<TableCell>{obs.address}</TableCell>
									<TableCell>
										<Box>
											{(obs.issueType ?? []).map((it, i) => (
												<Typography key={`${obs.id}-${i}`} variant="body2" component="span">
													{i > 0 ? ", " : ""}
													{it}
												</Typography>
											))}
										</Box>
									</TableCell>
									<TableCell>{formatTimestamp(obs.createdAt)}</TableCell>

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
				if (companyDetail) {
					setRowData(companyDetail)
				}
			})
		}
	}, [id])

	return (
		<Box>
			<Card variant="outlined" sx={{ p: 2, borderRadius: 0.5, mb: 2 }}>
				<Stack direction="row" alignItems="center" spacing={2} justifyContent="space-between">
					<Stack direction="row" spacing={2} alignItems="center">
						<Avatar
							src={rowData?.avatar}
							alt={rowData?.agent_name}
							sx={{ width: 48, height: 48, bgcolor: "#1976d2", fontWeight: 600 }}
						>
							{
								!rowData?.avatar &&
								rowData?.agent_name
									?.split(" ")
									.map(word => word[0]?.toUpperCase())
									.join("")
							}
						</Avatar>
						<Box>
							<Typography fontWeight={700}>{rowData?.agent_name}</Typography>
							<Typography variant="body2" color="text.secondary">
								{rowData.email}
							</Typography>
							<Typography component="caption" color="text.secondary"> {rowData?.phone_number}</Typography>


						</Box>
					</Stack>
					{/* <Stack>
						<Typography variant="body2" color="text.secondary">
						</Typography>
					</Stack> */}
					<Box sx={{ textAlign: 'left' }}>
						<Typography variant="body2" color="text.secondary">
							Agent ID :  <Typography component="span" color="text.primary"> {rowData?.unique_id}</Typography>
						</Typography>
						<Typography variant="body2" color="text.secondary">
							Date Added : <Typography component="span" color="text.primary"> {formatTimestamp(rowData?.createdAt)}</Typography>
						</Typography>
					</Box>

					<Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
						<Chip
							color={rowData?.status == 1 ? "success" : 'warning'}
							variant="outlined"
							size='medium'
							label={rowData?.status == 1 ? 'Active' : 'Inactive'}
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
					Lead Activity
				</Typography>
				<Divider />

				<Stack spacing={2}>
					{rowData?.zones?.length > 0 ?
						rowData?.zones?.map((z, i) => (
							<ZoneCard key={i} zone={rowData} index={i} />
						))
						:
						<Box sx={{
							textAlign: 'center',
							py: 2
						}}>
							<Typography variant='body1'>

								No leads have been captured by this agent yet. Once the agent submits leads through the app, they’ll appear here automatically.
							</Typography>
						</Box>
					}
				</Stack>

			</Card>
		</Box>
	);
}
