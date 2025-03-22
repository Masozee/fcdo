import type { Metadata } from "next";

type Props = {
  params: { code: string };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const countryCode = params.code.toUpperCase();
  
  return {
    title: `${countryCode} | Indonesia's Strategic Dependency`,
    description: `Explore Indonesia's trade relationship with ${countryCode} - view import/export data, supply chains, and strategic dependencies.`,
    openGraph: {
      title: `${countryCode} | Indonesia's Strategic Dependency`,
      description: `Explore Indonesia's trade relationship with ${countryCode} - view import/export data, supply chains, and strategic dependencies.`,
      url: `https://isdp.csis.or.id/country/${params.code}`,
      images: [
        {
          url: "/logo.png",
          width: 1200,
          height: 630,
          alt: `${countryCode} - Indonesia's Strategic Dependency`
        }
      ],
    },
    twitter: {
      title: `${countryCode} | Indonesia's Strategic Dependency`,
      description: `Explore Indonesia's trade relationship with ${countryCode} - view import/export data, supply chains, and strategic dependencies.`,
    },
  };
}