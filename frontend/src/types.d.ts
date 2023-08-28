export type MedicalInfo = {
    allergies: boolean,
    asthma: boolean,
    epilepsy: boolean,
    diabetes: boolean,
    other: boolean,
    details: string,
    user: string | null
}

export type EmergencyContact = {
    full_name: string,
    contact_number: string,
    user: string | null
}
