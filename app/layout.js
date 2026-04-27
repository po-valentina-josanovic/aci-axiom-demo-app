import "./globals.css";
import TopNav from "./components/TopNav";
import Sidebar from "./components/Sidebar";
import Footer from "./components/Footer";

export const metadata = {
  title: "Axiom Demo App",
  description: "ACI Axiom Demo Application",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col" suppressHydrationWarning>
        <TopNav />
        <div className="flex flex-1">
          <Sidebar />
          <main className="flex-1 flex flex-col min-w-0">
            {children}
            <Footer />
          </main>
        </div>
      </body>
    </html>
  );
}
