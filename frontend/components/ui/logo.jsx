import Image from 'next/image';

const Logo = ({ width, height, src }) => (
  <div className="mb-1">
    <Image
      src={src}
      alt="logo"
      width={width ? width : 80}
      height={height ? height : 60}
      style={{ objectFit: 'contain' }}
    />
  </div>
);

export default Logo;
