export type EventType = "pool_session"
    | "club_paddle"
    | "race_training"
    | "coaching"
    | "paddles_trips_tours"
    | "social_events"
    | "fun_session"
    | "race"
    | "beginners_course";

export type EventAllowedRoles = "none" | "non-members" | "juniors" | "members";

export type Event = {
    id?: number,
    title: string,
    description?: string,
    location?: string,
    start_date: Date,
    end_date?: Date,
    type: EventType,
    price?: number
    junior_price?: number
    is_full_day: boolean,
    is_recurring: boolean
    last_occurence?: Date,
    has_multiple: boolean,
    parent_event?: number,
    event_count?: number,
    event_index?: number,
    max_spaces?: number,
    allowed_roles?: EventAllowedRoles[],
    leaders?: string[],
    user_created?: string,
    date_created?: string,
}
