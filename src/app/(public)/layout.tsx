import { PublicFooter } from "./_components/public-footer";
import { PublicNavigation } from "./_components/public-navigation";

const PublicLayout = ({
  children,
  modal,
}: Readonly<{
  children: React.ReactNode;
  modal: React.ReactNode;
}>) => {
  return (
    <div className="flex min-h-screen flex-col justify-between gap-16">
      <div className="flex flex-col gap-4">
        <PublicNavigation />
        <main className="container mx-auto">
          {children}
          {modal}
        </main>
      </div>
      <PublicFooter />
    </div>
  );
};

export default PublicLayout;
