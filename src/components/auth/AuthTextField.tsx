"use client";

import { TextField, type TextFieldProps } from "@mui/material";

export default function AuthTextField(props: TextFieldProps) {
  return (
    <TextField
      variant="outlined"
      size="medium"
      fullWidth
      {...props}
      sx={{
        mb: 2,
        "& .MuiOutlinedInput-root": {
          borderRadius: 2,
          bgcolor: "background.paper",
        },
        ...props.sx,
      }}
    />
  );
}
