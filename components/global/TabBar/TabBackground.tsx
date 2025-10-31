import Svg, { Path } from "react-native-svg";
import { colors } from "@/styles";

export function TabBackground() {
  return (
    <Svg width="100%" height={80} viewBox="0 0 400 80">
      <Path
        d="
          M0,0 
          H400 
          V80 
          H0 
          Z
          M140,0 
          C180,60 220,60 260,0
        "
        fill={colors.black}
      />
    </Svg>
  );
}
