import type { SeedService } from "./types";

/**
 * Seed content for services (the initial CMS rows).
 * The admin can edit all of this at /admin/content/services.
 */
export const seedServices: SeedService[] = [
  {
    slug: "computer-repair",
    name: "Computer & Laptop Repair",
    shortDesc:
      "Slow, broken, or behaving strangely — PCs, laptops and Macs repaired at your home, our workshop, or remotely.",
    description:
      "A slow computer is frustrating, but it's usually fixable — and often without spending much. We repair PCs, laptops and Macs with failed hard drives, cracked screens, overheating, startup problems, and machines that simply won't turn on.\n\nYou can have us come to you anywhere in the Perth metro, drop your device off at our workshop, or we can connect remotely for software problems that don't need someone onsite. Either way, we'll explain what's gone wrong in plain English and talk you through your options before any work starts.\n\nYou'll get a fixed quote first, and nothing gets done without your OK. If a repair isn't worth the money, we'll tell you honestly rather than talk you into it.",
    delivery: "onsite,remote,workshop",
    priceFrom: "From $89",
    priceNotes: "We give you a fixed quote before any work begins — no surprises.",
    icon: "laptop",
    sortOrder: 1,
  },
  {
    slug: "virus-removal",
    name: "Virus & Malware Removal",
    shortDesc:
      "Suspect a virus? We'll clean your device, remove the nasties, and set you up so it doesn't happen again.",
    description:
      "Pop-ups everywhere, a computer that's grinding to a halt, or a scary message telling you to call a number? Those are common signs of malware — and you don't have to deal with it alone.\n\nWe remove viruses, spyware, adware and browser hijackers, then check that your security settings, updates and backups are actually doing their job. Most clean-ups can be done remotely or onsite, at your choice, and usually within the same visit.\n\nThere's no judgement here — it happens to almost everyone. We'll explain how the infection likely got in, help you avoid it next time, and give you a fixed quote before we start.",
    delivery: "onsite,remote,workshop",
    priceFrom: "From $99",
    priceNotes: "We give you a fixed quote before any work begins — no surprises.",
    icon: "shield",
    sortOrder: 2,
  },
  {
    slug: "data-recovery",
    name: "Data Recovery",
    shortDesc:
      "Photos, documents, precious files — if it's recoverable, we'll get it back. Free assessment and honest advice.",
    description:
      "Losing photos, documents or years of family files is horrible. Before you give up — or try that free tool you found online — let us take a careful look. The more you use the device after a failure, the lower the chance of getting your files back.\n\nBring your laptop, desktop, external drive, USB stick or phone to our workshop, or arrange a metro drop-off. We assess it, tell you what we found, and only go ahead with your approval. No data recovered means no recovery fee.\n\nSome failures are simple and quick. Others are serious and need specialist work — if that's the case, we'll say so honestly and explain your options rather than promise something we can't deliver.",
    delivery: "workshop",
    priceFrom: "Free assessment",
    priceNotes: "Free assessment. If we can't recover your data, there's no recovery fee.",
    icon: "drive",
    sortOrder: 3,
  },
  {
    slug: "it-support",
    name: "IT Support & Troubleshooting",
    shortDesc:
      "Friendly, plain-English help with whatever's gone wrong — no question too small, no jargon, no judgement.",
    description:
      "Not sure why your email won't send, your printer has stopped, or an update has changed everything? That's exactly the kind of thing we help with. No question is too small, and we never make you feel silly for asking.\n\nWe can visit you at home, or connect remotely using AnyDesk and fix things while you watch. You're in control the whole time and can see everything we're doing on your screen.\n\nWe explain each step in plain English, write down anything useful for next time, and quote before we begin. Patient, practical help — that's the whole idea.",
    delivery: "onsite,remote",
    priceFrom: "$79 per hour",
    priceNotes: "We give you a fixed quote before any work begins — no surprises.",
    icon: "headset",
    sortOrder: 4,
  },
  {
    slug: "managed-it",
    name: "Small Business Managed IT",
    shortDesc:
      "Keep your small business running smoothly with ongoing IT care, security and support on a simple monthly plan.",
    description:
      "You've got a business to run — you shouldn't be worrying about backups, updates and whether the office Wi-Fi will behave today. Our managed IT plans take that off your plate.\n\nWe look after your computers, email, network and security, keep everything patched and backed up, and give you a single friendly person to call when something goes wrong. Plans are month to month, with clear pricing and no lock-in.\n\nEvery plan starts with a free chat about what you actually use. We'll recommend what's worth paying for, skip what isn't, and put it all in writing in plain English.",
    delivery: "onsite,remote",
    priceFrom: "From $99 per month",
    priceNotes: "Month-to-month plans — no lock-in contracts.",
    icon: "briefcase",
    sortOrder: 5,
  },
  {
    slug: "new-setup",
    name: "New PC & Device Setup",
    shortDesc:
      "New computer, phone or tablet? We'll set it up properly, transfer your files and show you how it all works.",
    description:
      "A brand-new computer should feel exciting, not confusing. We set it up properly — accounts, updates, security, printers, email and your important programs — and move your files across from the old machine.\n\nWe can do this at your home or remotely, and we'll sit with you afterwards and show you what's changed and where everything is. No rushing, no assumptions.\n\nYou keep a simple written summary of what was set up and how to do the basics. If something isn't right in the first couple of weeks, call us and we'll sort it.",
    delivery: "onsite,remote",
    priceFrom: "From $99",
    priceNotes: "We give you a fixed quote before any work begins — no surprises.",
    icon: "setup",
    sortOrder: 6,
  },
  {
    slug: "networking",
    name: "NBN, Wi-Fi & Home Networking",
    shortDesc:
      "Patchy Wi-Fi, confusing modems or dead zones — we'll get your whole home online and fast.",
    description:
      "Wi-Fi that drops out in the back bedroom, a modem with too many flashing lights, or a new NBN connection nobody explained — these are everyday jobs for us.\n\nWe come to your home, test what's actually happening, and fix the cause rather than guessing. That might mean repositioning your modem, adding a mesh unit, replacing ageing gear, or simply setting things up properly.\n\nYou'll get a clear explanation of what was wrong, what we changed and why, plus honest advice on whether extra equipment is genuinely worth buying. Fixed quote first, always.",
    delivery: "onsite",
    priceFrom: "From $109",
    priceNotes: "We give you a fixed quote before any work begins — no surprises.",
    icon: "wifi",
    sortOrder: 7,
  },
  {
    slug: "smart-devices",
    name: "Phone, Tablet & Smart Home Help",
    shortDesc:
      "Printers, smart TVs, streaming, smart speakers and everything in between — set up right and explained simply.",
    description:
      "New phone that won't transfer your photos, a smart TV with five remotes, or a printer that's given up talking to your laptop — we can help with all of it, plus smart speakers, streaming services and video calling.\n\nWe can visit, or connect remotely for things like phones, tablets and accounts. We'll set it up, test it works, and then show you and anyone else in the house how to use it — patiently, as many times as you need.\n\nYou don't need to understand the technology. That's our job. You just need to know which button to press, and we'll make sure you do.",
    delivery: "onsite,remote",
    priceFrom: "From $79",
    priceNotes: "We give you a fixed quote before any work begins — no surprises.",
    icon: "devices",
    sortOrder: 8,
  },
  {
    slug: "sourcing",
    name: "Hardware & Software Sales",
    shortDesc:
      "Need a new laptop, part or software licence? Tell us what you do and we'll source the right one at a fair price.",
    description:
      "Buying tech can feel like a minefield — dozens of similar-looking options and salespeople pushing the most expensive one. Tell us what you actually use your computer for and your budget, and we'll recommend the right fit.\n\nWe source laptops, desktops, monitors, parts, printers and software licences, and can set everything up for you so it works properly from day one. No online shop and no pressure — just a quote for what you need.\n\nIf the honest answer is that you don't need to upgrade yet, we'll say so. We'd rather keep your trust than make a sale.",
    delivery: "remote",
    priceFrom: "Quoted per order",
    priceNotes: "We give you a fixed quote before any work begins — no surprises.",
    icon: "cart",
    sortOrder: 9,
  },
];
