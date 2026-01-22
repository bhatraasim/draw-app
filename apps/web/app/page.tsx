// import Image, { type ImageProps } from "next/image";
import { Button } from "@repo/ui/button";
// import styles from "./page.module.css";

// type Props = Omit<ImageProps, "src"> & {
//   srcLight: string;
//   srcDark: string;
// };

// const ThemeImage = (props: Props) => {
//   const { srcLight, srcDark, ...rest } = props;

//   return (
//     <>
//       <Image {...rest} src={srcLight} className="imgLight" />
//       <Image {...rest} src={srcDark} className="imgDark" />
//     </>
//   );
// };

export default function Home() {
  return (
    <div className=" flex justify-center m-100"> wadmuyaa zuuu humaiii project chalgaya 
      <Button
        appName="Draw"
        className="px-4 py-2 rounded bg-black text-white"
      >
        Love You hai humaa
      </Button>
    </div>
  );
}
