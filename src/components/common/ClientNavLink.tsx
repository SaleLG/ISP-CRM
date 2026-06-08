"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";

interface Props {
  href: string;
  children: React.ReactNode;
  style?: React.CSSProperties;
}

export default function ClientNavLink({ href, children, style }: Props) {
  const router = useRouter();
  const [, startTransition] = useTransition();

  return (
    <span
      role="link"
      tabIndex={0}
      onClick={() => startTransition(() => router.push(href))}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          startTransition(() => router.push(href));
        }
      }}
      style={{
        color: "#1976d2",
        cursor: "pointer",
        textDecoration: "none",
        ...style,
      }}
    >
      {children}
    </span>
  );
}
