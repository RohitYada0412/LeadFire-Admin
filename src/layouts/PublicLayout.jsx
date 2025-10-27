import { Box } from "@mui/material"
import { Outlet } from "react-router-dom"

export default function PublicLayout() {
    return (
        // <Container maxWidth="sm">
        // </Container>
            <Box>
                <Outlet />
            </Box>
    )
}
