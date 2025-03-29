import Image from "next/image";

const Logo = () => {
  return (
    <>
      <Image
        src="/logo/text_color.svg"
        alt="SokratesT Logo"
        width={150}
        height={40}
        className="h-14 w-auto dark:hidden"
      />
      <Image
        src="/logo/text_white.svg"
        alt="SokratesT Logo"
        width={150}
        height={40}
        className="hidden h-14 w-auto dark:block"
      />
    </>
  );
};

export { Logo };
