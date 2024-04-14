import { RRule } from "rrule";
import type { EventItem } from "~/types";
import type { EventWizardItem } from "~/components/events/wizard/EventWizard.vue";

export function getEventInstanceForDate (eventItem: EventItem, date: Date): number {
  if (!eventItem.rrule) {
    throw createError("Event is missing rule");
  }

  const rule = RRule.fromString(eventItem.rrule);
  const eventStart = new Date(eventItem.start_date);
  const untilDate = rule.options.until;

  const end = new Date(date);
  const endDate = untilDate && untilDate < end ? untilDate : date;

  const occurrences = rule.between(eventStart, endDate, true);

  return occurrences.length;
}

export function getEventUrl (eventItem: EventItem, date?: Date) {
  let href = `/events/${eventItem.parent_event || eventItem.id}`;

  if (eventItem.is_recurring && date) {
    const instance = getEventInstanceForDate(eventItem, date);
    href += `?instance=${instance}`;
  }

  return href;
}

export function getDatesOfInstance (event: EventItem, instance: number) {
  const startDate = new Date(event.start_date);
  const endDate = new Date(event.end_date);

  const duration = endDate.getTime() - startDate.getTime();
  const ruleData = RRule.fromString(event.rrule!);

  // TODO: This will need some optimisation in the future.
  // Has to iterator over each date to get to the current instance
  const all = ruleData.all((_, i) => {
    return i < instance + 1;
  });

  const start = all[instance];

  start.setHours(startDate.getHours(), startDate.getMinutes(), startDate.getSeconds());
  const end = new Date(start.getTime() + duration);

  return {
    start,
    end
  };
}

export const BeginnersCourseTemplate: EventWizardItem = {
  name: "Beginners Course",
  description: "<p>Paddle with us! If you're thinking of joining Maidstone Canoe Club and learning to paddle, you're in the right place! Our beginner's courses are designed to give you the basic skills to control the boat. Once you've completed the course, you'll have the confidence and abilities to join us on our trips, tours and regular paddles on the Medway and beyond.</p><p>Please note all courses must be pre-booked - all novice paddlers must attend one of our beginner courses. Full details of the courses and how to get involved in paddling (including how to join the Club if you're already an experience paddler) are <a href=\"/come-paddle/paddle-with-us\" target=\"_blank\">available on this page</a> - please take a look if you haven't already.</p><p>Our courses cost  65 for adults and  45 for children, and are run by our friendly qualified coaches. They consist of 8 hours coaching time - either 4 x two-hour sessions, 2 x four-hour sessions, or occasionally 1 x eight-hour session- and follow the syllabus for the nationally-recognised <a href=\"https://gopaddling.info/discover-awards/\" target=\"_blank\" rel=\"noopener noreferrer\">British Canoeing Discover Award</a>.</p><p>Please bring a packed lunch or some snacks to keep you going.</p>",
  location: "Maidstone Canoe Club",
  type: "beginners_course",
  occurrenceType: "multi",
  allowedRoles: [
    {
      id: "non-members",
      name: "Non-members"
    },
    {
      id: "juniors",
      name: "Juniors"
    }
  ],
  maxSpaces: 8,
  price: 6500,
  juniorPrice: 4500,
  leaders: [],
  paddleType: "coached_paddle",
  advancedPricing: false,
  oneTimePayment: false
};

export const BlankEventTemplate: EventWizardItem = {
  occurrenceType: "single",
  location: "Maidstone Canoe Club",
  allowedRoles: [],
  leaders: [],
  advancedPricing: false,
  oneTimePayment: false
};
