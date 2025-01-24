import { navigationItems } from "@/settings/menus";
import Link from "next/link";

const PublicFooter = () => {
  return (
    <div className="w-full bg-foreground py-20 text-background lg:py-40">
      <div className="container mx-auto">
        <div className="grid items-center gap-10 lg:grid-cols-2">
          <div className="flex flex-col items-start gap-8">
            <div className="flex flex-col gap-2">
              <h2 className="max-w-xl text-left font-regular text-3xl tracking-tighter md:text-5xl">
                SokratesT
              </h2>
              <p className="max-w-lg text-left text-background/75 text-lg leading-relaxed tracking-tight">
                Your personal tutor.
              </p>
            </div>
            <div className="flex flex-row gap-20">
              <div className="flex max-w-lg flex-col text-left text-background/75 text-sm leading-relaxed tracking-tight">
                <p>Rhine-Waal University</p>
                <p>Kamp-Lintford</p>
                <p>Germany</p>
              </div>
              <div className="flex max-w-lg flex-col text-left text-background/75 text-sm leading-relaxed tracking-tight">
                <Link href="/">Terms of service</Link>
                <Link href="/">Privacy Policy</Link>
              </div>
            </div>
          </div>
          <div className="grid items-start gap-10 lg:grid-cols-3">
            {navigationItems.map((item) => (
              <div
                key={item.title}
                className="flex flex-col items-start gap-1 text-base"
              >
                <div className="flex flex-col gap-2">
                  {item.href ? (
                    <Link
                      href={item.href}
                      className="flex items-center justify-between"
                    >
                      <span className="text-xl">{item.title}</span>
                    </Link>
                  ) : (
                    <p className="text-xl">{item.title}</p>
                  )}
                  {item.items?.map((subItem) => (
                    <Link
                      key={subItem.title}
                      href={subItem.href}
                      className="flex items-center justify-between"
                    >
                      <span className="text-background/75">
                        {subItem.title}
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export { PublicFooter };
