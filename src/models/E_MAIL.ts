import { DataStructure } from "./DataStructure";
import { PERSON_HEADER } from "./PERSON_HEADER";

export class E_MAIL extends DataStructure {
      // Client
    MANDT: string;

    // Person Number (Sample Application)
    PERSNUMBER: number;

    // Seqeunce Number (Sample Application)
    SEQNO_E_MAIL: number;

    // E-mail Address (Sample Application)
    E_ADDR: string;

    // E-mail Address Description (Sample Application)
    E_ADDR_TEXT: string;

    constructor(personHeader: PERSON_HEADER) {
        super();
        this.Fid = personHeader.Lid
    }
}