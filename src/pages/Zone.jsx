import React, { useEffect, useMemo, useState } from "react";

import { Button, FormControl, Grid2, InputAdornment, MenuItem, Select, TextField } from "@mui/material";
import Iconify from "../components/common/iconify/Iconify";

import { useSelector } from "react-redux";
import ZoneDialog from "../components/zone/AddNew";
import ZoneTable from "../components/zone/ZoneComponent";
import { getCompanyById } from "../FirebaseDB/companies";
import { getZoneById, listZones, updateZoneStatus } from "../FirebaseDB/zone";
import ConfirmDialog from "../components/common/ConfirmDialog";
import { doc, getDoc, getFirestore } from "firebase/firestore";
import { listAgents } from "../FirebaseDB/agent";
import { generatePassword } from "../utils/password";

const Zone = () => {

	const { isUser } = useSelector((state) => state.auth)
	const db = getFirestore();


	const [open, setOpen] = useState(false);
	const [loading, setLoading] = useState(true);
	const [rows, setRows] = useState([])
	const [rowAgent, setRowAgent] = useState([])
	const [debouncedSearch, setDebouncedSearch] = useState("");
	const [openConfirm, setOpenConfirm] = useState(false);
	const [status, setStatus] = useState({})

	const [filterData, setFilterData] = useState({
		// status: 1,
		// zone_id: ''
		search: ''
	})

	const [initialData, setInitialData] = useState({
		company_name: 'admin',
		zone_name: '',
		address: '',
		lat: '',
		lng: "",
		radius_value: '',
		radius_unit: '' // km mi
	})
	const [companyId, setCompanyId] = useState('')

	const handleClickOpen = () => setOpen(true);
	const PAGE_SIZE = 50;


	const agentParams = useMemo(() => {
		const authRaw = localStorage.getItem("auth");
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
	}, [filterData.status, debouncedSearch]);


	useEffect(() => {
		const id = setTimeout(
			() => setDebouncedSearch(filterData?.search?.trim()),
			250
		);
		return () => clearTimeout(id);
	}, [filterData.search]);

	useEffect(() => {
		const unsub = listZones(agentParams, (docs) => {
			setRows(docs);
			setLoading(false);
		});
		return () => unsub();
	}, [agentParams, debouncedSearch, filterData]);

	const handleSelect = async (id, nextStatus) => {
		setOpenConfirm(true)
		setStatus({
			id: id,
			nextStatus: nextStatus
		})
	}

	const handleSelectConfirm = async (id, nextStatus) => {
		const prevRow = rows.find(r => r.id === id);
		const prevStatus = prevRow?.status;

		setRows(prev => prev.map(r => (r.id === id ? { ...r, status: nextStatus } : r)));

		try {
			await updateZoneStatus(String(id), nextStatus);
		} catch (err) {
			console.error("Failed to update company:", err);
			setRows(prev => prev.map(r => (r.id === id ? { ...r, status: prevStatus } : r)));
		} finally {
			console.log('final');

		}
	};

	useEffect(() => {
		if (!open || !companyId) return;
		let cancelled = false;

		(async () => {
			try {
				const ref = doc(getFirestore() || db, "zones", String(companyId));
				const snap = await getDoc(ref);
				if (!cancelled && snap.exists()) {
					const d = snap.data();
					console.log("zone:", d);
					setInitialData(d)
					// setState here if needed, e.g. setZone({ id: snap.id, ...d });
				}
			} catch (error) {
				console.error("Failed to load zone:", error);
			}
		})();

		return () => {
			cancelled = true;
		};
	}, [open, companyId]);

	useEffect(() => {
		let cancelled = false;
		(async () => {
			setLoading(true);
			try {
				const { rows } = await listAgents(
					agentParams,
					(docs) => {
						setRowAgent(docs);
						setLoading(false);
					},

					{ cursor: null, pageSize: PAGE_SIZE }
				);
				if (cancelled) return;
				setRowAgent(rows);
			} finally {
				if (!cancelled) setLoading(false);
			}
		})();
		return () => {
			cancelled = true;
		};
	}, [agentParams]);

	return (
		<React.Fragment>
			<Grid2 container spacing={2} className='mb-2' alignItems="center">
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
								value={filterData.status || 0}
								onChange={(e) => {
									setFilterData((prev) => ({
										...prev,
										status: e.target.value,
									}));
								}}
							>
								<MenuItem value={0} disabled>
									All Status
								</MenuItem>
								<MenuItem value={1}>Active</MenuItem>
								<MenuItem value={2}>Inactive</MenuItem>
							</Select>
						</FormControl>
					</Grid2>

					{isUser && <Grid2>
						<Button
							variant="contained"
							color="error"
							onClick={handleClickOpen}
							sx={{ borderRadius: 0.8 }}
							size="small"
						>
							+ Add New Zone
						</Button>
					</Grid2>}
				</Grid2>
			</Grid2>

			<ZoneTable
				data={rows}
				loading={loading}
				setStatus={handleSelect}
				setCompanyId={setCompanyId}
				setOpen={setOpen}
				isUser={isUser}
			/>

			{open &&
				<ZoneDialog
					open={open}
					handleClose={() => setOpen(false)}
					initialData={initialData}
					companyId={companyId}
					setInitialData={setInitialData}
					setCompanyId={setCompanyId}
					onClose={() => setOpen(false)}
					rowAgent={rowAgent}
					onSubmitZone={(z) => {
						console.log('z :-', z);
					}}

				/>
			}

			<ConfirmDialog
				open={openConfirm}
				title="Status Confirmation"
				message="Are you sure you want to change the status of this Zone?"
				onClose={setOpenConfirm}
				onConfirm={handleSelectConfirm}
			/>

		</React.Fragment>
	)
}

export default Zone