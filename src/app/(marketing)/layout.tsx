import SiteHeader from "@/components/marketing/SiteHeader";
import SiteFooter from "@/components/marketing/SiteFooter";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {/* Ambient background */}
      <div
        className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
        aria-hidden="true"
      >
        <span className="absolute -left-40 -top-56 h-[620px] w-[620px] rounded-full bg-[radial-gradient(circle,#16a34a,transparent_70%)] opacity-40 blur-[100px]" />
        <span className="absolute right-[-200px] top-[12%] h-[540px] w-[540px] rounded-full bg-[radial-gradient(circle,#15803d,transparent_70%)] opacity-30 blur-[100px]" />
        <span className="absolute -bottom-72 left-[30%] h-[680px] w-[680px] rounded-full bg-[radial-gradient(circle,#166534,transparent_70%)] opacity-35 blur-[100px]" />
        <span className="absolute right-[10%] top-[60%] h-[400px] w-[400px] rounded-full bg-[radial-gradient(circle,#22c55e,transparent_70%)] opacity-10 blur-[100px]" />
      </div>

      <SiteHeader />
      <main className="flex-1">{children}</main>
      <SiteFooter />
    </>
  );
}
