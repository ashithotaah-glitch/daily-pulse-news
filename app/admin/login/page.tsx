import type { Metadata } from "next";
import { AdminLoginForm } from "@/components/AdminLoginForm";

export const metadata: Metadata = {
  title: "Admin Login"
};

export default function AdminLoginPage() {
  return <AdminLoginForm />;
}
