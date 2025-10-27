import * as React from 'react'
import { useTheme, Card, CardContent, CardHeader, Box, Grid2 as Grid } from '@mui/material'
import { BarChart } from '@mui/x-charts/BarChart'
import { PieChart } from '@mui/x-charts/PieChart'
import { LineChart } from '@mui/x-charts/LineChart'

export default function AdminOverview() {
    const theme = useTheme()

    // Colors from your theme
    const red = theme.palette.primary.main         // brand crimson
    const green = theme.palette.success.main
    const yellow = theme.palette.warning.main
    const greyLine = theme.palette.grey[400]

    // --- Bar data: Issues by Company (last 30 days)
    const companies = ['TechCorp', 'BuildPro', 'LogiFlow', 'DataSync', 'CloudTech']
    const issuesCount = [22, 17, 31, 12, 18]

    // --- Pie data: Issue status breakdown
    const statusData = [
        { id: 0, value: 60, label: 'Resolved', color: green },
        { id: 1, value: 30, label: 'Pending', color: yellow },
        { id: 2, value: 10, label: 'Critical', color: red },
    ]

    // --- Line data: Agent activity trend
    const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
    const thisWeek = [40, 55, 60, 72, 75, 58, 35]
    const lastWeek = [35, 42, 50, 54, 62, 49, 30]

    return (
        <Box>
            <Grid container spacing={2}>
                <Grid item size={{ xs: 12, md: 6 }}>
                    <Card variant='outlined' sx={{ height: '100%' }}>
                        <CardHeader title="Issues by Company (Last 30 Days)" />
                        <CardContent>
                            <BarChart
                                height={240}
                                xAxis={[{ data: companies, scaleType: 'band' }]}
                                series={[{ data: issuesCount, color: red }]}
                                slotProps={{
                                    legend: { hidden: true },
                                }}
                                margin={{ top: 10, right: 10, bottom: 30, left: 40 }}
                                sx={{
                                    '& .MuiChartsAxis-line, & .MuiChartsAxis-tick': { stroke: greyLine },
                                    '& .MuiChartsAxis-tickLabel': { fill: theme.palette.text.secondary, fontSize: 12 },
                                    '& .MuiBarElement-root': { rx: 6 },
                                }}
                            />
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item size={{ xs: 12, md: 6 }}>
                    <Card variant='outlined' sx={{ height: '100%' }}>
                        <CardHeader title="Issue Status Breakdown" />
                        <CardContent>
                            <PieChart
                                height={240}
                                series={[{
                                    data: statusData,
                                    innerRadius: 0,    // full pie (set to e.g. 40 for donut)
                                    paddingAngle: 1,
                                    cornerRadius: 3,
                                    arcLabel: (item) => item.label,
                                    arcLabelMinAngle: 15,
                                }]}
                                slotProps={{
                                    legend: { direction: 'row', position: { vertical: 'bottom', horizontal: 'middle' } },
                                }}
                                sx={{
                                    '& .MuiChartsArcLabel-root': {
                                        fill: theme.palette.text.primary,
                                        fontSize: 12,
                                    },
                                }}
                            />
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item size={{ xs: 12, md: 12 }}>
                    <Card variant='outlined' sx={{ height: '100%' }}>
                        <CardHeader title="Agent Activity Trend" />
                        <CardContent>
                            <LineChart
                                height={240}
                                xAxis={[{ scaleType: 'point', data: weekDays }]}
                                series={[
                                    { label: 'This Week', data: thisWeek, color: theme.palette.secondary.main, curve: 'catmullRom' },
                                    { label: 'Last Week', data: lastWeek, color: theme.palette.grey[700], curve: 'catmullRom' },
                                ]}
                                slotProps={{
                                    legend: { position: { vertical: 'bottom', horizontal: 'middle' } },
                                }}
                                margin={{ top: 10, right: 20, bottom: 40, left: 40 }}
                                sx={{
                                    '& .MuiChartsAxis-line, & .MuiChartsAxis-tick': { stroke: greyLine },
                                    '& .MuiChartsAxis-tickLabel': { fill: theme.palette.text.secondary, fontSize: 12 },
                                    '& .MuiLineElement-root': { strokeWidth: 2.5 },
                                    '& .MuiMarkElement-root': { r: 2.5 },
                                }}
                            />
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        </Box>
    )
}
