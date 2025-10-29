import Image from 'next/image';

type Props = {
  height?: number;
  width?: number;
};

const AppLogo = ({ height = 40, width = 40 }: Props) => (
  <Image
    width={height}
    height={width}
    src="/logo.png"
    alt="App Logo"
    loading="eager"
    priority
  />
);

export default AppLogo;
