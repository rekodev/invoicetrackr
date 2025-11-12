import Image from 'next/image';
import { useTranslations } from 'next-intl';

type Props = {
  height?: number;
  width?: number;
};

const AppLogo = ({ height = 40, width = 40 }: Props) => {
  const t = useTranslations('header.a11y');

  return (
    <Image
      width={width}
      height={height}
      src="/logo.png"
      alt={t('app_logo_alt')}
      loading="eager"
      priority
    />
  );
};

export default AppLogo;
