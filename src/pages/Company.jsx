import { Button, FormControl, Grid2, InputAdornment, MenuItem, Select, TextField } from "@mui/material";
import React, { useEffect, useState } from "react";
import Iconify from "../components/common/iconify/Iconify";
import AddCompanyDialog from "../components/company/AddNew";
import ResponsiveCompanyTable from "../components/company/CompanyComponent";
import { getCompanyById, listenCompanies, updateCompany } from "../FirebaseDB/companies";
import { generateTempPassword } from "../utils/password";

const Company = () => {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [rows, setRows] = useState([])
    const [debouncedSearch, setDebouncedSearch] = useState("");

    const [filterData, setFilterData] = useState({
        status: 0,
        zone: 0,
        search: ''
    })

    const [initialData, setInitialData] = useState({
        company_name: "",
        email: "",
        temp_password: generateTempPassword({ length: 10 }),
        user_name: 'company',
        user_type: 2
    })
    const [companyId, setCompanyId] = useState('')

    const handleClickOpen = () => setOpen(true);

    useEffect(() => {
        const id = setTimeout(
            () => setDebouncedSearch(filterData?.search?.trim()),
            250
        );
        return () => clearTimeout(id);
    }, [filterData.search]);

    useEffect(() => {

        const payload = {
            limitBy: 50,
            search: debouncedSearch,
            ...filterData
        }

        const unsub = listenCompanies({limitBy: 50}, (docs) => {
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
                                value={filterData.zone}
                                onChange={(e) => {
                                    setFilterData((prev) => ({
                                        ...prev,
                                        zone: e.target.value,
                                    }));
                                }}
                            >
                                <MenuItem value={0} disabled>
                                    All Zone
                                </MenuItem>
                                <MenuItem value={1}>Zone 1</MenuItem>
                                <MenuItem value={2}>Zone 2</MenuItem>
                                <MenuItem value={3}>Zone 3</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid2>

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
                                    All Status
                                </MenuItem>
                                <MenuItem value={1}>Active</MenuItem>
                                <MenuItem value={2}>Inactive</MenuItem>
                                <MenuItem value={3}>Pending</MenuItem>
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
            />

            {open &&
                <AddCompanyDialog
                    open={open}
                    handleClose={() => setOpen(false)}
                    initialData={initialData}
                    companyId={companyId}
                    setInitialData={setInitialData}
                    setCompanyId={setCompanyId}

                />
            }


        </React.Fragment>
    )
}

export default Company