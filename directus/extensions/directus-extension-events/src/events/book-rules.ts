// The booking rules the website applies, checked again by /events/book so they can't be skipped by calling the
// API directly. Keep these in step with the bookers (EventBooker, SingleBooker, MultiBooker) and, for prices,
// with frontend/server/api/payments/create.post.ts.

// Matches frontend/app/utils/roles.ts
const roleLevels: Record<string, number> = {
  unverified: 0,
  junior: 1,
  unapproved: 2,
  member: 3,
  coach: 4,
  committee: 5,
  administrator: 6
};

// The values an event's allowed_roles can hold, as user roles
const allowedRoleToRole: Record<string, string | null> = {
  "non-members": "unapproved",
  "juniors": "junior",
  "members": "member",
  "coach": "coach",
  "committee": "committee",
  "none": null,
  "no one": null
};

export type BookingUser = {
  id: string,
  parent?: string | null,
  dob?: string | null,
  bc_number?: string | number | null,
  is_coach?: boolean | null,
  role?: { name: string } | null
};

function roleName(user: BookingUser) {
  return user.role?.name?.toLowerCase() ?? "";
}

function ageOn(dob: string, date: Date) {
  const birthDate = new Date(dob);
  let age = date.getFullYear() - birthDate.getFullYear();
  const months = date.getMonth() - birthDate.getMonth();

  if (months < 0 || (months === 0 && date.getDate() < birthDate.getDate())) {
    age--;
  }

  return age;
}

// Why bookings for this event (or session) are closed, or null if they're open
export function bookingClosedReason(event: any, start: Date, end: Date, isSessionCancelled: boolean, now = new Date()) {
  if (event.status !== "published" || isSessionCancelled) {
    return "This event isn't open for booking";
  }

  if (now > end) {
    return "This event has finished";
  }

  if (!event.allow_booking_after_start) {
    if (event.last_booking_date && now > new Date(event.last_booking_date)) {
      return "Bookings for this event have closed";
    }

    if (now >= start) {
      return "Bookings closed when the event started";
    }
  }

  return null;
}

// Why this person can't go on this event, or null if they can
export function userNotAllowedReason(event: any, user: BookingUser, now = new Date()) {
  const allowed: string[] = (event.allowed_roles ?? []).map((role: string) => role.toLowerCase());

  if (allowed.some(role => allowedRoleToRole[role] === null)) {
    return "Nobody can book onto this event";
  }

  if (roleName(user) === "junior") {
    if (allowed.length && !allowed.includes("juniors")) {
      return "Juniors can't book onto this event";
    }
  } else if (allowed.length) {
    const level = roleLevels[roleName(user)] ?? -1;
    const adultRoles = allowed.map(role => allowedRoleToRole[role]).filter(role => role && role !== "junior") as string[];

    if (!adultRoles.some(role => level >= (roleLevels[role] ?? Infinity))) {
      return "Your membership doesn't allow you to book onto this event";
    }
  }

  if (event.min_age) {
    if (!user.dob || ageOn(user.dob, now) < event.min_age) {
      return `You must be at least ${event.min_age} to book onto this event`;
    }
  }

  return null;
}

// What this person would be charged in pence, the same way the payment page works it out
export function priceForUser(event: any, user: BookingUser): number | null {
  const role = roleName(user);

  if (event.advanced_pricing) {
    if (role === "junior") {
      if (event.non_member_junior_price) {
        return user.bc_number ? event.junior_price : event.non_member_junior_price;
      }
      return event.junior_price;
    }

    if (role === "coach" || user.is_coach) {
      return event.coach_price;
    }

    if (role === "member" || role === "committee") {
      return event.member_price;
    }

    if (role === "unapproved") {
      return event.non_member_price;
    }

    return event.price;
  }

  return role === "junior" ? event.junior_price : event.price;
}
