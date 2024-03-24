import { Link } from '@nextui-org/react';

import GitHubLogo from '../components/icons/GitHubLogo';

const Footer = () => {
  return (
    <div className='h-16 flex justify-center items-center border-t border-t-neutral-700'>
      Created by&nbsp;
      <Link
        href='https://github.com/rekodev'
        color='secondary'
        showAnchorIcon
        anchorIcon={<GitHubLogo />}
      >
        rekodev
      </Link>
    </div>
  );
};

export default Footer;
