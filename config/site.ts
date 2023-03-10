import { NavItem } from "@/types/nav"

interface SiteConfig {
  name: string
  description: string
  mainNav: NavItem[]
  links: {
    twitter: string
    github: string
  }
}

export const siteConfig: SiteConfig = {
  name: "BrikMate",
  description: "Real estate intelligence",
  mainNav: [
    {
      title: "Overview",
      href: "/",
    },
    {
      title: "Leases",
      href: "/leases",
    },
    // {
    //   title: "Reports",
    //   href: "/",
    // },
  ],
  links: {
    twitter: "https://twitter.com/brikmate",
    github: "https://github.com/rikuthinks/brikmate",
  },
}
