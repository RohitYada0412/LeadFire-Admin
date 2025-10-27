import { Avatar, Box, Stack, Typography } from '@mui/material';

import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';


import Paper from '@mui/material/Paper';
import { styled } from '@mui/material/styles';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell, { tableCellClasses } from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import React from 'react';
import Label from './label';

const StyledTableCell = styled(TableCell)(({ theme }) => ({
	[`&.${tableCellClasses.head}`]: {
		backgroundColor: '#E639461A',
		// color: theme.palette.common.white,
		fontFamily: theme.typography.fontFamilyHeading,
		fontSize: 18,
	},
	[`&.${tableCellClasses.body}`]: {

		fontWeight: 500,
		fontSize: 16,
	},
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
	'&:nth-of-type(odd)': {
		backgroundColor: theme.palette.grey['100'],
	},
	'&:nth-of-type(even)': {
		backgroundColor: theme.palette.grey['200'],
	},
	'&:last-child td, &:last-child th': {
		border: 0,
	},
}));


const TabelComponent = ({ data, setEditId, setOpen, title }) => {
	return (
		<React.Fragment>
			<Box sx={{ my: 2 }}>
				<Typography variant='h4' sx={{ mb: 1 }}>
					{title}
				</Typography>
				<TableContainer component={Paper} >
					<Table sx={{ minWidth: 700 }} aria-label="customized table">
						<TableHead>
							<TableRow>
								<StyledTableCell>Agent Name</StyledTableCell>
								<StyledTableCell align='center'>Email</StyledTableCell>
								<StyledTableCell align='center'>Agent ID</StyledTableCell>
								<StyledTableCell align='center'>Zone</StyledTableCell>
								<StyledTableCell align='center'>Issues</StyledTableCell>
								<StyledTableCell align='center'>Date Joined</StyledTableCell>
								<StyledTableCell align='center'>Status</StyledTableCell>
								<StyledTableCell align="right">Actions</StyledTableCell>
							</TableRow>
						</TableHead>

						<TableBody>
							{data.map((row) => {
								const id = row.id
								const name = row.name
								const email = row.email ?? row.user_email ?? '—'
								const zone = row.zone ?? 'Zone name'
								const issues = row.issues ?? row.story_count ?? 0
								const date = row.dateJoined ?? row.created_at ?? '—'
								const isActive = row.status === 'Active' || row.status === true
								const statusLbl = isActive ? 'Active' : 'Inactive'
								const avatar = row.avatar ?? `https://i.pravatar.cc/48?u=${encodeURIComponent(email || name)}`

								return (
									<StyledTableRow key={id}>
										{/* Agent Name + avatar */}
										<StyledTableCell>
											<Stack direction="row" spacing={1.25} alignItems="center">
												<Avatar src={avatar} alt={name} />
												<Typography fontWeight={700}>{name}</Typography>
											</Stack>
										</StyledTableCell>

										{/* Email */}
										<StyledTableCell align="left">
											<Typography color="text.secondary">{email}</Typography>
										</StyledTableCell>

										{/* Agent ID */}
										<StyledTableCell align="center">{id}</StyledTableCell>

										{/* Zone */}
										<StyledTableCell align="center">{zone}</StyledTableCell>

										{/* Issues / Story count */}
										<StyledTableCell align="center">{issues}</StyledTableCell>

										{/* Date joined / created_at */}
										<StyledTableCell align="center">
											<Stack direction="row" spacing={0.75} alignItems="center" justifyContent="center">
												<CalendarMonthIcon fontSize="small" sx={{ color: 'text.secondary' }} />
												<Typography color="text.secondary">{date}</Typography>
											</Stack>
										</StyledTableCell>

										<StyledTableCell align="center">
											<Label
												sx={{
													px: 2,
													borderRadius: 999,
													fontWeight: 600,
													color: isActive ? '#10B981' : '#EF4444',
													backgroundColor: isActive ? 'rgba(16,185,129,0.10)' : 'rgba(239,68,68,0.10)',
												}}
											>
												{statusLbl}
											</Label>
										</StyledTableCell>

										{/* Actions */}
										<StyledTableCell align="right">
											<Stack direction="row" spacing={1} justifyContent="flex-end">
												<Label
												color='primary'
													// variant=
													sx={{ px: 2, cursor: 'pointer',borderRadius:50 }}
													onClick={() => { setEditId(id); setOpen(true) }}
												>
													View Detail
												</Label>
											</Stack>
										</StyledTableCell>
									</StyledTableRow>
								)
							})}
						</TableBody>
					</Table>
				</TableContainer>
			</Box>
		</React.Fragment>
	);
}

export default TabelComponent