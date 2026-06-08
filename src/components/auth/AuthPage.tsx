"use client";

import { Box, Card, CardContent, Container, Typography } from "@mui/material";

interface AuthPageProps {
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
}

export default function AuthPage({
  title = "ISP CRM",
  subtitle,
  children,
}: AuthPageProps) {
  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        bgcolor: "background.default",
        py: 4,
      }}
    >
      <Container maxWidth="sm">
        <Card elevation={2}>
          <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
            <Typography
              variant="h4"
              color="primary"
              gutterBottom
              align="center"
              fontWeight={700}
            >
              {title}
            </Typography>
            {subtitle && (
              <Typography
                variant="subtitle1"
                color="text.secondary"
                align="center"
                sx={{ mb: 3 }}
              >
                {subtitle}
              </Typography>
            )}
            {children}
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
}
