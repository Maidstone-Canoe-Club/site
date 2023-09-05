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

export type InviteData = {
    id: string,
    email: string,
    club_number: number,
    bc_number: number,
    first_name: string,
    last_name: string,
}

export interface EventItem {
    id?: number,
    title: string,
    location?: string,
    description?: string,
    start_date: Date,
    end_date?: Date,
    is_full_day: boolean,
    is_recurring: boolean
    has_multiple: boolean,
    // recurring_pattern: RecurringEventPattern,
    parent_event_id?: number,
    user_created?: string,
    date_created?: string,

    max_attendees?: number,
    price?: number
}
