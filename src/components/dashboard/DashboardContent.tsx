"use client";

import { Typography, Grid, Alert } from "@mui/material";
import PeopleIcon from "@mui/icons-material/People";
import PhoneIcon from "@mui/icons-material/Phone";
import EmailIcon from "@mui/icons-material/Email";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import EventIcon from "@mui/icons-material/Event";
import InventoryIcon from "@mui/icons-material/Inventory";
import ScheduleIcon from "@mui/icons-material/Schedule";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import FiberNewIcon from "@mui/icons-material/FiberNew";
import PhoneCallbackIcon from "@mui/icons-material/PhoneCallback";
import AssignmentLateIcon from "@mui/icons-material/AssignmentLate";
import HistoryIcon from "@mui/icons-material/History";
import StatCard from "@/components/dashboard/StatCard";
import SimpleBarChart from "@/components/dashboard/SimpleBarChart";
import type { DashboardStats } from "@/lib/types";

function AdminDashboard({ stats }: { stats: DashboardStats }) {
  return (
    <>
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={4} lg={3}>
          <StatCard title="Total Customers" value={stats.totalCustomers} icon={<PeopleIcon />} />
        </Grid>
        <Grid item xs={12} sm={6} md={4} lg={3}>
          <StatCard title="Junior Sales Leads" value={stats.juniorSalesLeads} color="#1565c0" icon={<PhoneIcon />} />
        </Grid>
        <Grid item xs={12} sm={6} md={4} lg={3}>
          <StatCard title="Senior Sales Leads" value={stats.seniorSalesLeads} color="#1976d2" icon={<PhoneIcon />} />
        </Grid>
        <Grid item xs={12} sm={6} md={4} lg={3}>
          <StatCard
            title="Unassigned Escalations"
            value={stats.unassignedSeniorEscalations}
            color="#7b1fa2"
            icon={<AssignmentLateIcon />}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4} lg={3}>
          <StatCard title="No Reply — Recycle Hold" value={stats.recycleHold} color="#ed6c02" icon={<InventoryIcon />} />
        </Grid>
        <Grid item xs={12} sm={6} md={4} lg={3}>
          <StatCard title="Ready to Recycle" value={stats.recycleReady} color="#2e7d32" icon={<ScheduleIcon />} />
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

function JuniorDashboard({ stats }: { stats: DashboardStats }) {
  return (
    <>
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={4} lg={3}>
          <StatCard title="My Leads" value={stats.totalCustomers} icon={<PeopleIcon />} />
        </Grid>
        <Grid item xs={12} sm={6} md={4} lg={3}>
          <StatCard title="New (Not Called)" value={stats.newLeads} color="#2e7d32" icon={<FiberNewIcon />} />
        </Grid>
        <Grid item xs={12} sm={6} md={4} lg={3}>
          <StatCard title="Attempt 1" value={stats.attempt1} color="#1565c0" icon={<PhoneIcon />} />
        </Grid>
        <Grid item xs={12} sm={6} md={4} lg={3}>
          <StatCard title="Attempt 2" value={stats.attempt2} color="#1976d2" icon={<PhoneIcon />} />
        </Grid>
        <Grid item xs={12} sm={6} md={4} lg={3}>
          <StatCard title="Attempt 3" value={stats.attempt3} color="#0d47a1" icon={<PhoneIcon />} />
        </Grid>
        <Grid item xs={12} sm={6} md={4} lg={3}>
          <StatCard title="Calls Logged" value={stats.callsLogged} color="#5c6bc0" icon={<HistoryIcon />} />
        </Grid>
        <Grid item xs={12} sm={6} md={4} lg={3}>
          <StatCard title="Rescheduled" value={stats.rescheduled} color="#0288d1" icon={<EventIcon />} />
        </Grid>
        <Grid item xs={12} sm={6} md={4} lg={3}>
          <StatCard title="Closed" value={stats.closed} color="#616161" icon={<CheckCircleIcon />} />
        </Grid>
      </Grid>

      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <SimpleBarChart
            title="My Leads by ISP"
            data={stats.customersByIsp.map((d) => ({ label: d.name, count: d.count }))}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <SimpleBarChart
            title="Outreach Progress"
            data={[
              { label: "New", count: stats.newLeads },
              { label: "Attempt 1", count: stats.attempt1 },
              { label: "Attempt 2", count: stats.attempt2 },
              { label: "Attempt 3", count: stats.attempt3 },
            ].filter((d) => d.count > 0)}
            color="#1565c0"
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <SimpleBarChart
            title="My Calls by Result"
            data={stats.callsByResult.map((d) => ({ label: d.result, count: d.count }))}
            color="#2e7d32"
          />
        </Grid>
      </Grid>
    </>
  );
}

function SeniorDashboard({ stats }: { stats: DashboardStats }) {
  return (
    <>
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={4} lg={3}>
          <StatCard title="My Assigned Leads" value={stats.totalCustomers} icon={<PeopleIcon />} />
        </Grid>
        <Grid item xs={12} sm={6} md={4} lg={3}>
          <StatCard
            title="Callback Requested"
            value={stats.callbackRequested}
            color="#7b1fa2"
            icon={<PhoneCallbackIcon />}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4} lg={3}>
          <StatCard title="Calls Logged" value={stats.callsLogged} color="#5c6bc0" icon={<HistoryIcon />} />
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
            title="My Leads by ISP"
            data={stats.customersByIsp.map((d) => ({ label: d.name, count: d.count }))}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <SimpleBarChart
            title="My Leads by Stage"
            data={stats.customersByStage.map((d) => ({ label: d.stage, count: d.count }))}
            color="#42a5f5"
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <SimpleBarChart
            title="My Calls by Result"
            data={stats.callsByResult.map((d) => ({ label: d.result, count: d.count }))}
            color="#2e7d32"
          />
        </Grid>
      </Grid>
    </>
  );
}

export default function DashboardContent({
  stats,
}: {
  stats: DashboardStats;
}) {
  const isSenior = stats.scope === "senior_sales";
  const isJunior = stats.scope === "junior_sales";

  const emptyMessage = isSenior
    ? "No leads assigned to you yet. A manager must escalate a callback or reschedule from Junior Sales, then assign the lead to you on the Senior Sales Team page."
    : isJunior
      ? "No leads on Junior Sales Team yet. New imports appear here for Attempt 1–3 outreach."
      : null;

  const subtitle = isSenior
    ? "Your assigned callback and reschedule escalations."
    : isJunior
      ? "Your Junior Sales outreach workload."
      : "Overview across all teams and pipeline stages.";

  return (
    <>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        {subtitle}
      </Typography>

      {stats.totalCustomers === 0 && emptyMessage && (
        <Alert severity="info" sx={{ mb: 3 }}>
          {emptyMessage}
        </Alert>
      )}

      {stats.scope === "admin" && <AdminDashboard stats={stats} />}
      {stats.scope === "junior_sales" && <JuniorDashboard stats={stats} />}
      {stats.scope === "senior_sales" && <SeniorDashboard stats={stats} />}
    </>
  );
}
