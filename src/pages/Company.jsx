import { Button, FormControl, Grid2, InputAdornment, MenuItem, Select, TextField } from "@mui/material";
import React, { useEffect, useMemo, useState } from "react";
import Iconify from "../components/common/iconify/Iconify";
import AddCompanyDialog from "../components/company/AddNew";
import ResponsiveCompanyTable from "../components/company/CompanyComponent";
import { deleteAgents, deleteCompany, deleteZones, getCompanyById, listenCompanies1, updateCompany } from "../FirebaseDB/companies";
import { generateTempPassword } from "../utils/password";
import ConfirmDialog from "../components/common/ConfirmDialog";

const Company = () => {
	const [open, setOpen] = useState(false);
	const [loading, setLoading] = useState(true);
	const [rows, setRows] = useState([])
	const [debouncedSearch, setDebouncedSearch] = useState("");
	const [openConfirm, setOpenConfirm] = useState(false);
	const [isDeleting, setIsDeleting] = useState(false);



	const [filterData, setFilterData] = useState({
		status: 1,
		search: ''
	})

	const [initialData, setInitialData] = useState({
		company_name: "",
		email: "",
		temp_password: generateTempPassword({ length: 10 }),
		user_name: 'company',
		user_type: 2,
		first_name: '',
		last_name: '',
		phone_number: ''
	})
	const [companyId, setCompanyId] = useState(null)
	const handleClickOpen = () => setOpen(true);

	const PAGE_SIZE = 50;


	const agentParams = useMemo(() => {
		const authRaw = sessionStorage.getItem("auth");
		const auth = authRaw ? JSON.parse(authRaw) : null;

		const companyIdFromAuth =
			auth?.user?.role !== "admin" && auth?.user?.uid
				? String(auth.user.uid)
				: null;

		const p = { limitBy: PAGE_SIZE };

		if (companyIdFromAuth) p.company_id = companyIdFromAuth;

		if (filterData.status !== "" && filterData.status != null)
			p.status = Number(filterData.status);

		if (debouncedSearch) p.search = debouncedSearch;

		return p;
	}, [filterData.status, filterData.search, debouncedSearch]);



	useEffect(() => {
		const id = setTimeout(
			() => setDebouncedSearch(filterData?.search?.trim()),
			250
		);
		return () => clearTimeout(id);
	}, [filterData.search]);


	useEffect(() => {
		const unsub = listenCompanies1(agentParams, (docs) => {
			setRows(docs);
			setLoading(false);
		});
		return () => unsub();
	}, [agentParams, debouncedSearch, filterData]);

	const handleSelect = async (id, nextStatus) => {
		const prevRow = rows.find(r => r.id === id);
		const prevStatus = prevRow?.status;

		setRows(prev => prev.map(r => (r.id === id ? { ...r, status: nextStatus } : r)));

		try {
			await updateCompany(String(id), { status: Number(nextStatus) });
		} catch (err) {
			console.error("Failed to update company:", err);
			setRows(prev => prev.map(r => (r.id === id ? { ...r, status: prevStatus } : r)));
		} finally {
			console.log('final');

		}
	};

	useEffect(() => {
		if (open && companyId) {
			getCompanyById(companyId).then((companyDetail) => {
				console.log('companyDetail', companyDetail);
				setInitialData(companyDetail)

			})
		} else {
			setInitialData({
				company_name: "",
				email: "",
				temp_password: generateTempPassword({ length: 10 }),
				user_name: 'company',
				user_type: 2
			})
		}
	}, [companyId, open])

	// const handleSelectConfirm = async (id) => {
	// 	rows?.find((item) => item.id === companyId)

	// 	let agent_id = rows?.find((item) => item.id === companyId)

	// 	console.log('agent_id', agent_id);

	// 	await deleteCompany(companyId)
	// 	await deleteAgents(agent_id)



	// 	setCompanyId(null)
	// }

	const handleSelectConfirm = async () => {
		if (!companyId) return;

		setIsDeleting(true);
		try {
			const companyRow = rows?.find((item) => item.id === companyId);

			const agentIds = companyRow?.agent_ids || [];
			const zoneIds = companyRow?.zone || [];

			if (agentIds.length > 0) {
				await deleteAgents(agentIds);
			}
			if (zoneIds.length > 0) {
				await deleteZones(zoneIds);
			}
			await deleteCompany(companyId);

		} catch (err) {
			console.error("delete flow failed", err);
			toast.error("Something went wrong while deleting company");
		} finally {
			setCompanyId(null);
			setIsDeleting(false)
			setOpenConfirm(false)
		}
	};

	return (
		<React.Fragment>
			<Grid2 container spacing={2} className='mb-2' alignItems="center">
				{/* Left side: Search */}
				<Grid2 size={{ xs: 12, md: 6 }}>
					<TextField
						name="search"
						fullWidth
						placeholder="Search…"
						variant="outlined"
						size="small"
						onChange={(e) =>
							setFilterData((prev) => ({
								...prev,
								search: e.target.value,
							}))
						}

						InputProps={{
							startAdornment: (
								<InputAdornment position="start">
									<Iconify icon="iconoir:search" />
								</InputAdornment>
							),
						}}
					/>
				</Grid2>

				{/* Right side: Filters + Button */}
				<Grid2
					size={{ xs: 12, md: 6 }}
					container
					justifyContent="flex-end"
					alignItems="center"
					spacing={1}
				>

					<Grid2>
						<FormControl size="small">
							<Select
								value={filterData.status}
								onChange={(e) => {
									setFilterData((prev) => ({
										...prev,
										status: e.target.value,
									}));
								}}
							>
								<MenuItem value={0} disabled>
									Status
								</MenuItem>
								<MenuItem value={1}>Active</MenuItem>
								<MenuItem value={2}>Inactive</MenuItem>
								<MenuItem value={3}>Archive</MenuItem>
							</Select>
						</FormControl>
					</Grid2>

					<Grid2>
						<Button
							variant="contained"
							color="error"
							onClick={handleClickOpen}
							sx={{ borderRadius: 0.8 }}
							size="small"
						>
							+ Add New Company
						</Button>
					</Grid2>
				</Grid2>
			</Grid2>



			<ResponsiveCompanyTable
				data={rows}
				loading={loading}
				setStatus={handleSelect}
				setCompanyId={setCompanyId}
				setOpen={setOpen}
				setOpenConfirm={setOpenConfirm}
			/>

			{open &&
				<AddCompanyDialog
					open={open}
					handleClose={() => setOpen(false)}
					initialData={initialData}
					companyId={companyId}
					setInitialData={setInitialData}
					setCompanyId={setCompanyId}
				// setOpenConfirm={setOpenConfirm}

				/>
			}

			<ConfirmDialog
				open={openConfirm}
				title="Delete Confirmation"
				message="Are you sure you want to permanently delete company?"
				onClose={setOpenConfirm}
				onConfirm={handleSelectConfirm}
				loading={isDeleting}
			/>
		</React.Fragment>
	)
}

export default Company