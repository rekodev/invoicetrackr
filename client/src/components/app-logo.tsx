import Image from 'next/image';
import { useTranslations } from 'next-intl';

const LOGO_ASPECT_RATIO = 920 / 960;

type Props = {
  width?: number;
};

const AppLogo = ({ width = 40 }: Props) => {
  const t = useTranslations('header.a11y');

  return (
    <Image
      width={width}
      height={Math.round(width * LOGO_ASPECT_RATIO)}
      src="/logo.png"
      alt={t('app_logo_alt')}
      style={{ width, height: 'auto' }}
      loading="eager"
      priority
    />
  );
};

export default AppLogo;
