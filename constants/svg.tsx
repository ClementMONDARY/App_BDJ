import { colors } from "@/styles";
import Svg, { Path } from "react-native-svg";

export function TabBarSvg() {
  return (
    <Svg
      width="1230"
      height="160"
      viewBox="0 0 1230 160"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <Path
        d="M1230 160H0V0H1230V160ZM563.484 0.0107422C583.612 0.011503 571.945 48.9893 615.242 48.9893C658.539 48.9889 647.447 0.0107422 667 0.0107422H563.484Z"
        fill={colors.black}
      />
    </Svg>
  );
}
