const RegisterLayout = async ({
  children,
  privacy,
}: Readonly<{
  children: React.ReactNode;
  privacy: React.ReactNode;
}>) => {
  return (
    <>
      {children}
      {privacy}
    </>
  );
};

export default RegisterLayout;
