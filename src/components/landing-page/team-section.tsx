import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Image from "next/image";
import { FaFacebook, FaGithub, FaInstagram, FaLinkedin } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";

interface TeamProps {
  imageUrl: string;
  name: string;
  position: string;
  description: string;
  socialNetworks: SociaNetworkslProps[];
}

interface SociaNetworkslProps {
  name: string;
  url: string;
}

const teamList: TeamProps[] = [
  {
    imageUrl: "/landing-page/lars-lorenz.png",
    name: "Lars Lorenz",
    position: "Developer & Project Manager",
    description:
      "Actively develops the Sokratesᵗ web application and manages the project's progress.",
    socialNetworks: [
      {
        name: "Linkedin",
        url: "https://www.linkedin.com/in/lars-lorenz/",
      },
      {
        name: "GitHub",
        url: "https://github.com/LarsLrn",
      },
    ],
  },
  {
    imageUrl: "/landing-page/alexander-gerber.jpg",
    name: "Prof. Alexander Gerber",
    position: "Project Lead",
    description:
      "Leads collaborative project efforts and applys Sokratesᵗ within his university courses.",
    socialNetworks: [
      {
        name: "Linkedin",
        url: "https://www.linkedin.com/in/alexandergerber/",
      },
      {
        name: "X",
        url: "https://x.com/inscico",
      },
    ],
  },
  {
    imageUrl: "/landing-page/ulrich-pfeiffer.jpg",
    name: "Prof. Dr. Ulrich Pfeiffer",
    position: "Project Lead",
    description:
      "Leads the psychological study, researching perception and impact of Sokratesᵗ.",
    socialNetworks: [
      {
        name: "Linkedin",
        url: "https://www.linkedin.com/in/prof-pfeiffer/",
      },
    ],
  },
];

const TeamSection = () => {
  const socialIcon = (iconName: string) => {
    switch (iconName) {
      case "Linkedin":
        return <FaLinkedin />;
      case "Facebook":
        return <FaFacebook />;
      case "Instagram":
        return <FaInstagram />;
      case "GitHub":
        return <FaGithub />;
      case "X":
        return <FaXTwitter />;
    }
  };

  return (
    <section id="team" className="container py-24 sm:py-32">
      <h2 className="mb-4 font-bold text-3xl md:text-4xl">Project Team</h2>

      <p className="mt-4 mb-10 text-muted-foreground text-xl">
        Working together to bring you the best learning experience.
      </p>

      <div className="grid gap-8 gap-y-10 md:grid-cols-2 lg:grid-cols-3">
        {teamList.map(
          ({
            imageUrl,
            name,
            position,
            socialNetworks,
            description,
          }: TeamProps) => (
            <Card
              key={name}
              className="relative mt-8 flex flex-col items-center justify-center bg-muted/50"
            >
              <CardHeader className="mt-8 flex items-center justify-center pb-2">
                <Image
                  src={imageUrl}
                  alt={`${name} ${position}`}
                  width={96}
                  height={96}
                  className="-top-12 absolute aspect-square h-24 w-24 rounded-full object-cover"
                />
                <CardTitle className="text-center">{name}</CardTitle>
                <CardDescription className="text-primary">
                  {position}
                </CardDescription>
              </CardHeader>

              <CardContent className="pb-2 text-center text-muted-foreground">
                <p>{description}</p>
              </CardContent>

              <CardFooter>
                {socialNetworks.map(({ name, url }: SociaNetworkslProps) => (
                  <div key={name}>
                    <a
                      rel="noreferrer noopener"
                      href={url}
                      target="_blank"
                      className={buttonVariants({
                        variant: "ghost",
                        size: "sm",
                      })}
                    >
                      <span className="sr-only">{name} icon</span>
                      {socialIcon(name)}
                    </a>
                  </div>
                ))}
              </CardFooter>
            </Card>
          ),
        )}
      </div>
    </section>
  );
};

export { TeamSection };
