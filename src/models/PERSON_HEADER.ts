import { DataStructure } from "./DataStructure";

export class PERSON_HEADER extends DataStructure {

    // Client
    MANDT: string;

    // Person Number (Sample Application)
    PERSNUMBER: number;

    // First Name (Sample Application)
    FIRST_NAME: string;

    // Last Name (Sample Application)
    LAST_NAME: string;

    // Profession (Sample Application)
    PROFESSION: string;

    // Gender (Sample Application)
    SEX: string;

    // Birthday (Sample Application)
    BIRTHDAY: string;

    // Weight (Sample Application)
    WEIGHT: number;

    // Height (Sample Application)
    HEIGHT: number;

    // Category1 (Sample Application)
    CATEGORY1: number;

    // Category2 (Sample Application)
    CATEGORY2: string;

    // Created on
    CREDAT: string;

    // Created by
    CRENAM: string;

    // Create Time
    CRETIM: string;

    // Last Changed on
    CHGDAT: string;

    // Last Changed by
    CHGNAM: string;

    // Last Changed at
    CHGTIM: string;

}

export class ConatactHeader {
    section: string;
    personHeaders: PERSON_HEADER[];
}