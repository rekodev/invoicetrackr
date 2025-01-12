"use client";

import { Link } from "@nextui-org/react";

import AppLogo from "./icons/AppLogo";
import GitHubLogo from "../components/icons/GitHubLogo";

const Footer = () => {
  return (
    <footer className="flex flex-col items-center justify-center py-8 border-t border-t-neutral-800 gap-4">
      <div className="flex gap-2 items-center">
        <AppLogo />{" "}
        <p className="text-md font-semibold">
          INVOICE<span className="text-secondary-600">TRACKR</span>
        </p>
      </div>
      <nav>
        <ul className="flex gap-2 text-default-600">
          <li>
            <Link color="foreground" href="/terms-of-service">
              Terms of Service
            </Link>
          </li>
          <li>
            <Link color="foreground" href="/privacy-policy">
              Privacy Policy
            </Link>
          </li>
        </ul>
      </nav>
      <div className="text-default-500">
        Created by&nbsp;
        <Link
          href="https://github.com/rekodev"
          color="secondary"
          showAnchorIcon
          anchorIcon={<GitHubLogo />}
        >
          rekodev
        </Link>
      </div>
    </footer>
  );
};

export default Footer;
