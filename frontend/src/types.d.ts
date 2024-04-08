import type {DirectusUser} from "nuxt-directus/dist/runtime/types";

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
  id: string | null,
  full_name: string,
  contact_number: string,
  user: string | null
}

export type InviteCheckResult = {
  result: boolean,
  statusCode: number,
  invite?: InviteData
}

export type InviteData = {
  id: string,
  email: string,
  club_number: number,
  bc_number: number,
  first_name: string,
  last_name: string,
}

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

export type EventAllowedRoles = "none" | "non-members" | "juniors" | "members";

export interface EventItem {
  status: "published" | "cancelled" | "draft" | "archived",
  id?: string,
  title: string,
  description?: string,
  location?: string,
  start_date: Date,
  end_date: Date,
  type: EventType,
  price?: number,
  junior_price?: number,
  advanced_pricing?: boolean,
  member_price?: number,
  non_member_price?: number,
  coach_price?: number,
  is_full_day: boolean,
  is_recurring: boolean,
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
  rrule?: string,
  required_paddler_ability?: string,
  is_peer_paddle: boolean,
  disclaimer?: string,
  allow_bookings_after_start?: boolean,
  min_age?: number,
  bookings?: number,
  visible_attendees?: boolean,
  paddle_type?: "led_paddle" | "peer_paddle" | "coached_paddle"
}

export interface EventBooking {
  id: string,
  user: DirectusUser,
  event: EventItem,
  date: string,
  instance: number,
  status: string
}

export interface NewsItem {
  id: number | undefined,
  status: "published" | "draft" | "scheduled",
  title: string,
  content: string,
  slug: string,
  publish_date: string | Date | null,
  date_created: string,
  user_created: {
    id: string,
    first_name: string,
    last_name: string
  }
}

export interface Home {
  title?: string
  tagline?: string
}

export interface NewsSubscriber {
  user: DirectusUser,
  id: string,
  unsubscribe_token: string
}
