import {isMobile} from "react-device-detect";

export const logFunction = (...params: any) => {
  if (isMobile) {
    alert(params.join(' : '));
  }

  console.log(...params);
}
