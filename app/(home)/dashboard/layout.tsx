import DashboardTopBar from "@/components/dashboard/DashboardTopBar";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className={`mb-16 font-sans bg-white scroll-container sticky`}>
      <DashboardTopBar />
      <main className="min-h-screen bg-slate-100 mt-20">{children}</main>
    </div>
  );
}
