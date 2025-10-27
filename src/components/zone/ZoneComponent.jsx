import {
	Avatar,
	Box,
	Button,
	FormControl,
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
	Typography
} from '@mui/material';
import { styled } from '@mui/material/styles';

import { formatTimestamp } from '../../utils/service';


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

export default function ZoneTable({ data, setStatus, setCompanyId, setOpen, isUser  /* loading */ }) {

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
							<StyledTableCell>Zone Name</StyledTableCell>
							<StyledTableCell>Company Name</StyledTableCell>
							<StyledTableCell align="center">Location</StyledTableCell>
							<StyledTableCell align="center">Radius</StyledTableCell>
							<StyledTableCell>Issues</StyledTableCell>
							<StyledTableCell>Status</StyledTableCell>
							{isUser && <StyledTableCell align="right">Actions</StyledTableCell>}
						</TableRow>
					</TableHead>

					<TableBody>
						{data?.length > 0 ? data.map((r) => {
							const selectId = `status-select-${r.id}`;
							const labelId = `status-label-${r.id}`;
							return (
								<StyledTableRow key={r.id}>
									<StyledTableCell>
										{r.zone_name || 'N/A'}
									</StyledTableCell>

									<StyledTableCell sx={{ wordBreak: 'break-all' }}>
										{r.company_name}
									</StyledTableCell>
									<StyledTableCell align="center">{r.address}</StyledTableCell>
									<StyledTableCell align="center">{r.radius_value + r.radius_unit}</StyledTableCell>
									<StyledTableCell>{formatTimestamp(r.createdAt)}</StyledTableCell>
									<StyledTableCell>
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
												<MenuItem value={3}>Pending</MenuItem>
											</Select>
										</FormControl>
									</StyledTableCell>
									{isUser &&
										<StyledTableCell align="right">
											<Button size="small" variant="contained" color="error" sx={{ borderRadius: 0.5 }}
												onClick={() => {
													setOpen(true)
													setCompanyId(r?.id)
												}}
											>
												View Detail
											</Button>
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
			<Stack
				gap={1.5}
				sx={{ display: { xs: 'flex', sm: 'none' } }}
				aria-label="companies list mobile"
			>
				{data.map((r) => (
					<Paper
						key={r.id}
						variant="outlined"
						sx={{
							p: 1.5,
							borderRadius: 2,
							bgcolor: (t) => t.palette.grey[50],
						}}
					>
						<Stack direction="row" justifyContent="space-between" alignItems="center">
							<Typography fontWeight={700}>{r.company}</Typography>
							{/* <StatusChip status={r.status} /> */}
						</Stack>

						<Stack mt={1} spacing={0.5}>
							<Row label="Company ID" value={r.id} />
							<Row label="Email" value={r.email} />
							<Row label="Zone" value={r.zone} />
							<Row label="Agents" value={r.agents} />
							<Row label="Created" value={r.createdDate} />
						</Stack>

						<Stack direction="row" justifyContent="flex-end" mt={1}>
							<Button size="small" variant="contained" color="error" onClick={() => {
								setOpen(true)
								setCompanyId(r?.id)
							}}>
								View Detail
							</Button>
						</Stack>
					</Paper>
				))}
			</Stack>
		</Box>
	);
}

// small helper for mobile rows
function Row({ label, value }) {
	return (
		<Stack direction="row" gap={1}>
			<Typography variant="body2" color="text.secondary" sx={{ minWidth: 92 }}>
				{label}:
			</Typography>
			<Typography variant="body2" sx={{ wordBreak: 'break-all' }}>
				{value}
			</Typography>
		</Stack>
	);
}
