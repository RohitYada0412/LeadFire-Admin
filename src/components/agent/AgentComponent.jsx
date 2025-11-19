import {
	Avatar,
	Box,
	Button,
	FormControl,
	IconButton,
	MenuItem,
	Paper,
	Select,
	Stack,
	Table,
	TableBody,
	TableCell,
	tableCellClasses,
	TableContainer,
	TableHead,
	TableRow,
	Tooltip,
	Typography
} from '@mui/material';
import { styled } from '@mui/material/styles';

import { formatTimestamp } from '../../utils/service';
import { useNavigate } from 'react-router-dom';
import { deleteCurrentUser } from '../../FirebaseDB/auth';
import Iconify from '../common/iconify/Iconify';


const StyledTableCell = styled(TableCell)(({ theme }) => ({
	[`&.${tableCellClasses.head}`]: {
		backgroundColor: '#E639461A',
		fontFamily: theme.typography.fontFamilyHeading ?? theme.typography.fontFamily,
		fontSize: 16,
		fontWeight: 600,
	},

	[`&.${tableCellClasses.body}`]: {
		fontWeight: 500,
		fontSize: 14,
	},
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
	'&:nth-of-type(odd)': {
		backgroundColor: theme.palette.grey[100],
	},
	'&:nth-of-type(even)': {
		backgroundColor: theme.palette.grey[200],
	},
	'&:last-child td, &:last-child th': { border: 0 },
}));

export default function AgentTable({
	data, setStatus, setCompanyId, setOpen, isUser, page = 1, hasMore = false, onPrev, onNext, setOpenConfirm, loading = false
}) {
	const safeRows = Array.isArray(data) ? data : [];
	const navigate = useNavigate()

	return (
		<Box>
			<TableContainer
				component={Paper}
				elevation={0}
				sx={{
					//   borderRadius: 2,
					overflow: 'auto',
					border: '1px solid',
					borderColor: 'divider',
					display: { xs: 'none', sm: 'block' },
				}}
			>
				<Table stickyHeader aria-label="companies table">
					<TableHead>
						<TableRow>
							<StyledTableCell>Agent Name</StyledTableCell>
							<StyledTableCell align="center">Email</StyledTableCell>
							<StyledTableCell align="center">Agent ID</StyledTableCell>
							<StyledTableCell align="center">Date Added</StyledTableCell>
							<StyledTableCell align='center'>Status</StyledTableCell>
							{isUser && <StyledTableCell align="center"></StyledTableCell>}
						</TableRow>
					</TableHead>

					<TableBody>
						{safeRows?.length > 0 ? safeRows.map((r) => {
							const selectId = `status-select-${r.id}`;
							const labelId = `status-label-${r.id}`;
							return (
								<StyledTableRow key={r.id}>
									<StyledTableCell>
										<Stack direction='row' alignItems='center' spacing={1}>
											<Avatar />
											<Typography variant='h6' >
												{r.agent_name}
											</Typography>
										</Stack>
									</StyledTableCell>

									<StyledTableCell align="center" sx={{ wordBreak: 'break-all' }}>
										{r.email}
									</StyledTableCell>
									<StyledTableCell align="center">{r.unique_id}</StyledTableCell>

									<StyledTableCell align="center">{formatTimestamp(r.createdAt)}</StyledTableCell>
									<StyledTableCell align='center'>
										<FormControl size="small" sx={{ m: 1 }}>
											<Select
												labelId={labelId}
												id={selectId}
												value={r.status}
												onChange={(e) => {
													const next = Number(e.target.value);
													setStatus(r.id, next);
												}}
											>
												<MenuItem value={1}>Active</MenuItem>
												<MenuItem value={2}>Inactive</MenuItem>
											</Select>
										</FormControl>
									</StyledTableCell>
									{isUser &&
										<StyledTableCell align="right">
											<Box display="flex" justifyContent='flex-end' alignItems="center" gap={1}>
												<Tooltip title="View">
													<IconButton size="small"
														onClick={() => {
															navigate(`/agents/${r?.id}`)
														}}>
														<Iconify icon="material-symbols:visibility-outline" />
													</IconButton>
												</Tooltip>

												{/* Edit */}
												<Tooltip title="Edit">
													<IconButton size="small"
														onClick={() => {
															setOpen(true)
															setCompanyId(r?.id)

														}}>
														<Iconify icon="material-symbols:edit-square-outline" />
													</IconButton>
												</Tooltip>

												{/* Delete */}
												<Tooltip title="Delete">
													<IconButton size="small" color="error"
														onClick={() => {
															setOpenConfirm(true)
															setCompanyId(r?.id)
															setStatus({})
														}}
													>
														<Iconify icon="material-symbols:delete-outline" />
													</IconButton>
												</Tooltip>
											</Box>



										</StyledTableCell>}
								</StyledTableRow>
							)
						}) : <StyledTableRow>
							<StyledTableCell colSpan={8} align='center'>No data found!</StyledTableCell>
						</StyledTableRow>
						}
					</TableBody>
				</Table>
			</TableContainer>

			{/* Mobile (xs) – stacked “card” rows */}
			{/* Mobile (xs) – stacked “card” rows */}
			<Stack
				gap={1.5}
				sx={{ display: { xs: 'flex', sm: 'none' } }}
				aria-label="companies list mobile"
			>
				{safeRows.map((r) => (
					<Paper
						key={r.id}
						variant="outlined"
						sx={{ p: 1.5, borderRadius: 2, bgcolor: (t) => t.palette.grey[50] }}
					>
						<Stack direction="row" justifyContent="space-between" alignItems="center">
							<Typography fontWeight={700}>{r.agent_name || r.company || '—'}</Typography>
							{/* could show a status chip here */}
						</Stack>

						<Stack mt={1} spacing={0.5}>
							<Row label="Agent ID" value={r.id} />
							<Row label="Email" value={r.email} />
							<Row
								label="Zone"
								value={Array.isArray(r.zone) ? `${r.zone.length}` : (r.zone ?? 'N/A')}
							/>
							<Row label="Agents" value={r.agents ?? '—'} />
							<Row
								label="Created"
								// prefer the same source you used in desktop:
								value={formatTimestamp(r.createdAt)}
							/>
						</Stack>

						<Stack direction="row" justifyContent="flex-end" mt={1}>
							<Button
								size="small"
								variant="contained"
								color="error"
								onClick={() => {
									// setOpen(true); setCompanyId(r?.id);
									navigate(`agents/${r?.id}`)

								}}
							>
								View Detail
							</Button>
						</Stack>
					</Paper>
				))}
			</Stack>



			<Stack direction="row" alignItems="center" justifyContent="space-between" mt={2}>
				<Typography variant="body2" color="text.secondary">
					Page {page}
				</Typography>

				<Stack direction="row" spacing={1}>
					<Button
						variant="outlined"
						size="small"
						onClick={onPrev}
						disabled={page <= 1 || loading}
					>
						Previous
					</Button>
					<Button
						variant="contained"
						size="small"
						color="primary"
						onClick={onNext}
						disabled={!hasMore || loading}
					>
						Next
					</Button>
				</Stack>
			</Stack>
		</Box>
	);
}

// small helper for mobile rows
function Row({ label, value }) {
	const toDisplay = (v) => {
		if (v == null) return '—';
		if (Array.isArray(v)) return v.map(x => (typeof x === 'object' ? JSON.stringify(x) : String(x))).join(', ');
		if (typeof v === 'object') return JSON.stringify(v); // fallback for objects (e.g., Firestore Timestamp if it ever slips through)
		return String(v);
	};

	return (
		<Stack direction="row" gap={1}>
			<Typography variant="body2" color="text.secondary" sx={{ minWidth: 92 }}>
				{label}:
			</Typography>
			<Typography variant="body2" sx={{ wordBreak: 'break-all' }}>
				{toDisplay(value)}
			</Typography>
		</Stack>
	);
}

