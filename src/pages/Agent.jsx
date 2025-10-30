import {
	Button, FormControl,
	Grid2,
	InputAdornment,
	MenuItem, Select, TextField
} from "@mui/material";
import React, { useEffect, useMemo, useState } from "react";

import AgentTable from "../components/agent/AgentComponent";
import Iconify from "../components/common/iconify/Iconify";
import AddCompanyDialog from "../components/agent/AddNew";

// Firebase helpers
import { listAgents, updateAgent } from "../FirebaseDB/agent";
import { listenCompanies } from "../FirebaseDB/companies";
import { listZones } from "../FirebaseDB/zone";

import { useSelector } from "react-redux";
import { generatePassword, generateTempPassword } from "../utils/password";

import { doc, getDoc, getFirestore } from "firebase/firestore";
import ConfirmDialog from "../components/common/ConfirmDialog";
const db = getFirestore();

const PAGE_SIZE = 50;

const Agent = () => {
	const { isUser } = useSelector((state) => state.auth);

	const [open, setOpen] = useState(false);
	const [loading, setLoading] = useState(true);
	const [openConfirm, setOpenConfirm] = useState(false);
	const [status, setStatus] = useState({})


	// table rows
	const [rows, setRows] = useState([]);

	// filters/meta
	const [companies, setCompanies] = useState([]);
	const [zoneData, setZoneData] = useState([]);

	// search
	const [debouncedSearch, setDebouncedSearch] = useState("");

	// pagination
	const [page, setPage] = useState(1);
	const [pageCursors, setPageCursors] = useState([]); // [{firstDoc, lastDoc}]
	const [pagesCache, setPagesCache] = useState([]); // rows per page
	const [hasMore, setHasMore] = useState(true);

	// filters
	const [filterData, setFilterData] = useState({
		status: "",
		zone: [],
		search: "",
	});

	// currently edited agent id
	const [agentId, setAgentId] = useState(null);

	const [initialData, setInitialData] = useState({
		agent_name: "",
		first_name: "",
		last_name: "",
		email: "",
		zone: [],
		company_id: "",
		temp_password: "",
		photo: "",
		oldPhotoPath: null,
		status: 1,
		user_name: "agent",
		user_type: 3,
	});

	const handleClickOpen = () => setOpen(true);

	// debounce search
	useEffect(() => {
		const id = setTimeout(
			() => setDebouncedSearch(filterData.search.trim()),
			250
		);
		return () => clearTimeout(id);
	}, [filterData.search]);

	// build query params
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
		if (Array.isArray(filterData.zone) && filterData.zone.length > 0) {
			p.zone = filterData.zone.map(String);
		}
		if (debouncedSearch) p.search = debouncedSearch;

		return p;
	}, [filterData.status, filterData.zone, debouncedSearch]);

	// initial + reactive fetch with pagination reset
	useEffect(() => {
		let cancelled = false;
		(async () => {
			setLoading(true);
			try {
				const { rows, firstDoc, lastDoc, hasMore } = await listAgents(
					agentParams,
					(docs) => {
						setRows(docs);
						setLoading(false);
					},

					{ cursor: null, pageSize: PAGE_SIZE }
				);
				if (cancelled) return;
				setRows(rows);
				setPage(1);
				setPageCursors([{ firstDoc, lastDoc }]);
				setPagesCache([rows]);
				setHasMore(hasMore);
			} finally {
				if (!cancelled) setLoading(false);
			}
		})();
		return () => {
			cancelled = true;
		};
	}, [agentParams]);

	// next page
	const goNext = async () => {
		if (!hasMore || loading) return;
		setLoading(true);
		try {
			const current = pageCursors[page - 1];
			const { rows, firstDoc, lastDoc, hasMore: more } = await listAgents(
				agentParams,
				(docs) => {
					console.log('docs :- ', docs);

					setRows(docs);
					setLoading(false);
				},
				{ cursor: current.lastDoc, direction: "next", pageSize: PAGE_SIZE }
			);
			setRows(rows);
			setPageCursors((prev) => [...prev, { firstDoc, lastDoc }]);
			setPagesCache((prev) => [...prev, rows]);
			setPage((p) => p + 1);
			setHasMore(more);
		} finally {
			setLoading(false);
		}
	};

	// previous page
	const goPrev = async () => {
		if (page <= 1 || loading) return;

		const prevIndex = page - 2;
		const cached = pagesCache[prevIndex];
		if (cached) {
			setRows(cached);
			setPage((p) => p - 1);
			return;
		}

		setLoading(true);
		try {
			const current = pageCursors[page - 1];
			const { rows, firstDoc, lastDoc } = await listAgents(agentParams, (docs) => {
				console.log('docs :- ', docs);

				setRows(docs);
				setLoading(false);
			}
				, {
					cursor: current.firstDoc,
					direction: "prev",
					pageSize: PAGE_SIZE,
				});

			setRows(rows);
			setPageCursors((prev) => {
				const copy = [...prev];
				copy[prevIndex] = { firstDoc, lastDoc };
				return copy;
			});
			setPagesCache((prev) => {
				const copy = [...prev];
				copy[prevIndex] = rows;
				return copy;
			});
			setPage((p) => p - 1);
		} finally {
			setLoading(false);
		}
	};

	// companies & zones listeners
	useEffect(() => {
		const unsubCompanies = listenCompanies({ limitBy: 50 }, setCompanies);
		const unsubZones = listZones({ limitBy: 50 }, setZoneData);
		return () => {
			if (typeof unsubCompanies === "function") unsubCompanies();
			if (typeof unsubZones === "function") unsubZones();
		};
	}, []);

	// inline status update
	const handleSelect = async (id, nextStatus) => {
		setOpenConfirm(true)
		setStatus({
			id: id,
			nextStatus: nextStatus
		})
	};

	const handleSelectConfirm = async () => {
		const prevRow = rows.find((r) => r.id === status?.id);
		const prevStatus = prevRow?.status;

		setRows((prev) =>
			prev.map((r) => (r.id === status?.id ? { ...r, status: status?.nextStatus } : r))
		);

		try {
			await updateAgent(String(status?.id), { status: Number(status?.nextStatus) });
		} catch (err) {
			console.error("Failed to update agent:", err);
			// rollback
			setRows((prev) =>
				prev.map((r) => (r.id === status?.id ? { ...r, status: prevStatus } : r))
			);
		}
	};

	// Prefill dialog when editing
	useEffect(() => {
		if (open && agentId) {
			(async () => {
				try {
					const snap = await getDoc(doc(db, "agents", String(agentId)));
					if (snap.exists()) {
						const d = snap.data();
						setInitialData({
							agent_name: d.agent_name || "",
							email: d.email || "",
							zone: Array.isArray(d.zone) ? d.zone : d.zone ? [d.zone] : [],
							company_id: d.company_Id || "",
							temp_password: "",
							photo: "",
							oldPhotoPath: d.photoPath || null,
							status: d.status ?? 1,
							user_name: d.user_name ?? "agent",
							user_type: d.user_type ?? 3,
							phone_number: d.phone_number,
							last_name: d.last_name,
							first_name: d.first_name,
						});
					}
				} catch (e) {
					console.error("Failed to fetch agent:", e);
				}
			})();
		} else {
			setInitialData({
				agent_name: "",
				email: "",
				zone: [],
				company_id: "",
				temp_password: generatePassword(),
				photo: "",
				oldPhotoPath: null,
				status: 1,
				user_name: "agent",
				user_type: 3,
			});
		}
	}, [agentId, open]);




	return (
		<React.Fragment>
			<Grid2 container spacing={2} className="mb-2" alignItems="center">
				{/* Search */}
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

				{/* Filters + Add */}
				<Grid2
					size={{ xs: 12, md: 6 }}
					container
					justifyContent="flex-end"
					alignItems="center"
					spacing={1}
				>
					{/* Zones */}
					<Grid2>
						{/* <FormControl size="small">
							<Select
								multiple
								value={filterData.zone}
								onChange={(e) =>
									setFilterData((prev) => ({ ...prev, zone: e.target.value }))
								}
								displayEmpty
								renderValue={(selected) =>
									selected?.length ? `${selected.length} zone(s)` : "All Zones"
								}
								sx={{ minWidth: 160 }}
							>
								<MenuItem value="" disabled>
									All Zones
								</MenuItem>

								{zoneData.map((z) => (
									z.status === 1 &&
									<MenuItem key={z.id} value={z.id}>
										{z.zone_name || z.id}
									</MenuItem>
								))}
							</Select>
						</FormControl> */}
					</Grid2>

					{/* Status */}
					<Grid2>
						<FormControl size="small">
							<Select
								value={filterData.status}
								onChange={(e) =>
									setFilterData((prev) => ({
										...prev,
										status: e.target.value,
									}))
								}
								displayEmpty
								sx={{ minWidth: 140 }}
							>
								<MenuItem value="" disabled>Status</MenuItem>
								<MenuItem value={1}>Active</MenuItem>
								<MenuItem value={2}>Inactive</MenuItem>
							</Select>
						</FormControl>
					</Grid2>

					{isUser && (
						<Grid2>
							<Button
								variant="contained"
								color="error"
								onClick={handleClickOpen}
								sx={{ borderRadius: 0.8 }}
								size="small"
							>
								+ Add New Agent
							</Button>
						</Grid2>
					)}
				</Grid2>
			</Grid2>

			<AgentTable
				data={rows}
				loading={loading}
				setStatus={handleSelect}
				setCompanyId={setAgentId}
				setOpen={setOpen}
				isUser={isUser}
				page={page}
				hasMore={hasMore}
				onPrev={goPrev}
				onNext={goNext}
			/>

			{open && (
				<AddCompanyDialog
					open={open}
					handleClose={() => setOpen(false)}
					initialData={initialData}
					companyId={agentId}
					setInitialData={setInitialData}
					setCompanyId={setAgentId}
					companyData={companies}
					zoneData={zoneData}
				/>
			)}

			<ConfirmDialog
				open={openConfirm}
				title="Status Confirmation"
				message="Are you sure you want to change the status of this agent?"
				onClose={setOpenConfirm}
				onConfirm={handleSelectConfirm}
			/>
		</React.Fragment>
	);
};

export default Agent;
