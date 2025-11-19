import React, { useEffect, useMemo, useState } from "react";

import { Grid2, InputAdornment, TextField } from "@mui/material";
import Iconify from "../components/common/iconify/Iconify";

import { useSelector } from "react-redux";
import IssuesTable from "../components/Issues/IssuesComponent";
import { getCompanyById, updateCompany } from "../FirebaseDB/companies";
import { listenObservationById, listIssues } from "../FirebaseDB/issues";
import IssueSummaryDialog from "./IssueSummaryDialog";
import IssueSummarySkeletonDialog from "../components/common/IssueSummarySkeletonDialog";

const Issues = () => {

	const { isUser } = useSelector((state) => state.auth)

	const [open, setOpen] = useState(false);
	const [loading, setLoading] = useState(false);
	const [loadingId, setLoadingId] = useState(false);
	const [rows, setRows] = useState([])
	const [rowsById, setRowsById] = useState({})
	const [filterData, setFilterData] = useState({})
	const [openViewIssueId, setOpenViewIssueId] = useState(null)

	// const [initialData, setInitialData] = useState({
	// 	company_name: 'admin',
	// 	zone_name: '',
	// 	address: '',
	// 	lat: '',
	// 	lng: "",
	// 	radius_value: '',
	// 	radius_unit: '' // km mi
	// })
	const [companyId, setCompanyId] = useState('')
	const [debouncedSearch, setDebouncedSearch] = useState("");


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

		if (debouncedSearch) p.search = debouncedSearch;

		return p;
	}, [filterData.status, filterData.zone, debouncedSearch]);

	useEffect(() => {
		const id = setTimeout(
			() => setDebouncedSearch(filterData?.search),
			250
		);
		return () => clearTimeout(id);
	}, [filterData.search]);

	useEffect(() => {
		setLoading(true);
		const unsub = listIssues(agentParams, (docs) => {
			setRows(docs);
			setLoading(false);
		});
		return () => unsub();
	}, [debouncedSearch, filterData]);


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

		if (companyId) {
			setLoadingId(true)
			const unsub = listenObservationById(companyId, (docs) => {
				setRowsById(docs);
				setLoadingId(false);
			});
			return () => unsub();
		}
	}, [companyId])


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
			</Grid2>

			<IssuesTable
				data={rows}
				loading={loading}
				setStatus={handleSelect}
				setCompanyId={setCompanyId}
				setOpen={setOpen}
				isUser={isUser}
			/>



			{loadingId ?
				<IssueSummarySkeletonDialog
					open={open}
					onClose={() => setOpen(false)}
					setId={setOpenViewIssueId}
					issue={rowsById}
					Id={openViewIssueId}
					loading={loadingId}
				/>
				:
				<IssueSummaryDialog
					open={open}
					onClose={() => setOpen(false)}
					setId={setOpenViewIssueId}
					issue={rowsById}
					Id={openViewIssueId}
					loading={loadingId}
				/>
			}

		</React.Fragment>
	)
}

export default Issues