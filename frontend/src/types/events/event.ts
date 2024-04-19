import type { EventPaddleType } from "~/types";

export type EventType = "pool_session"
  | "club_paddle"
  | "race_training"
  | "coaching"
  | "paddles_trips_tours"
  | "social_event"
  | "fun_session"
  | "race"
  | "beginners_course"
  | "meetings";

export type OccurrenceType = "single" | "multi" | "recurring";

export type EventAllowedRoles = "none" | "non-members" | "juniors" | "members";

export type Event = {
  id?: string,
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

export type NewEventItem = {
  title: string,
  description?: string,
  location: string,
  start_date: Date | string,
  end_date: Date | string,
  max_spaces: number | null,
  last_occurrence?: Date
  last_booking_date?: Date,
  allowed_roles: string[],
  leaders?: string[],
  rrule?: string,
  type: EventType,
  occurrenceType: OccurrenceType,
  required_paddler_ability?: string,
  disclaimer?: string,
  allow_bookings_after_start?: boolean,
  min_age?: number,
  visible_attendees?: boolean,
  notifyUsers?: boolean,
  price?: number
  junior_price?: number
  coach_price?: number,
  member_price?: number,
  non_member_price?: number,
  non_member_junior_price?: number,
  paddle_type?: EventPaddleType,
  payment_reference?: string,
  one_time_payment?: boolean,
  advanced_pricing?: boolean
}
