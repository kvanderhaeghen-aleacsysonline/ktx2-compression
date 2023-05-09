import { KTX2Types } from "../constants/constants";

export function getKTX2Type(): KTX2Types {
    const selectedValue = (document.querySelector(".text-box")! as HTMLInputElement).value;
    return selectedValue && selectedValue !== '' ? selectedValue as KTX2Types : KTX2Types.ETC1S;
}