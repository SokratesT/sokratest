export default function Layout({
  children,
  file,
}: {
  children: React.ReactNode;
  file: React.ReactNode;
}) {
  return (
    <div className="-m-4 grid h-[calc(100svh-3.5rem)] max-h-[calc(100svh-3.5rem)] grid-cols-4">
      <div className="h-[calc(100svh-3.5rem)] max-h-[calc(100svh-3.5rem)]">
        {children}
      </div>
      <div className="col-span-3 flex max-h-[calc(100svh-3.5rem)] flex-col gap-4 p-4">
        {file}
      </div>
    </div>
  );
}
