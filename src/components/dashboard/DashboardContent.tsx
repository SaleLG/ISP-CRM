"use client";

import { Typography, Grid } from "@mui/material";
import PeopleIcon from "@mui/icons-material/People";
import PhoneIcon from "@mui/icons-material/Phone";
import HealingIcon from "@mui/icons-material/Healing";
import WarningIcon from "@mui/icons-material/Warning";
import EmailIcon from "@mui/icons-material/Email";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import EventIcon from "@mui/icons-material/Event";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import StatCard from "@/components/dashboard/StatCard";
import SimpleBarChart from "@/components/dashboard/SimpleBarChart";
import type { DashboardStats } from "@/lib/types";

export default function DashboardContent({ stats }: { stats: DashboardStats }) {
  return (
    <>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={4} lg={3}>
          <StatCard title="Total Customers" value={stats.totalCustomers} icon={<PeopleIcon />} />
        </Grid>
        <Grid item xs={12} sm={6} md={4} lg={3}>
          <StatCard title="Senior Sales Leads" value={stats.seniorSalesLeads} color="#1976d2" icon={<PhoneIcon />} />
        </Grid>
        <Grid item xs={12} sm={6} md={4} lg={3}>
          <StatCard title="Recovery Team Leads" value={stats.recoveryLeads} color="#7b1fa2" icon={<HealingIcon />} />
        </Grid>
        <Grid item xs={12} sm={6} md={4} lg={3}>
          <StatCard title="Recovery Needed" value={stats.recoveryNeeded} color="#ed6c02" icon={<WarningIcon />} />
        </Grid>
        <Grid item xs={12} sm={6} md={4} lg={3}>
          <StatCard title="Alerts Needing Email" value={stats.alertsNeedingEmail} color="#d32f2f" icon={<EmailIcon />} />
        </Grid>
        <Grid item xs={12} sm={6} md={4} lg={3}>
          <StatCard title="Price Approval Requests" value={stats.priceApprovalRequests} color="#f57c00" icon={<AttachMoneyIcon />} />
        </Grid>
        <Grid item xs={12} sm={6} md={4} lg={3}>
          <StatCard title="Rescheduled" value={stats.rescheduled} color="#0288d1" icon={<EventIcon />} />
        </Grid>
        <Grid item xs={12} sm={6} md={4} lg={3}>
          <StatCard title="New Accounts Created" value={stats.newAccountsCreated} color="#2e7d32" icon={<PersonAddIcon />} />
        </Grid>
        <Grid item xs={12} sm={6} md={4} lg={3}>
          <StatCard title="Closed" value={stats.closed} color="#616161" icon={<CheckCircleIcon />} />
        </Grid>
      </Grid>

      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <SimpleBarChart
            title="Customers by ISP"
            data={stats.customersByIsp.map((d) => ({ label: d.name, count: d.count }))}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <SimpleBarChart
            title="Customers by Workflow Stage"
            data={stats.customersByStage.map((d) => ({ label: d.stage, count: d.count }))}
            color="#42a5f5"
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <SimpleBarChart
            title="Customers by Assigned Team"
            data={stats.customersByTeam.map((d) => ({ label: d.team, count: d.count }))}
            color="#7b1fa2"
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <SimpleBarChart
            title="Call Attempts by Team"
            data={stats.callAttemptsByTeam.map((d) => ({ label: d.team, count: d.count }))}
            color="#2e7d32"
          />
        </Grid>
      </Grid>
    </>
  );
}
