// Tightens two sets of permissions that let any logged in user see or change other people's data.
//
// Users: every role could read every field of every user, so even a brand new Unverified account could download
// all members' emails, dates of birth, phone numbers and addresses. Directus 10 only allows one read rule per role,
// so these roles can now read other users' names and avatars only. Your own record is served in full by the
// users-me-hook, and the extensions return juniors and attendee details to the people allowed to see them.
// Committee keeps full access for the admin Users page.
//
// Bookings: Members, Coaches and Unapproved users could create bookings for anyone with any status (including
// "paid") and edit anyone's booking. Bookings are now only created through /events/book, which checks who is
// being booked, and these roles can only update attendance on events they lead or created.
//
// `directus bootstrap` runs this before `schema apply`, so on a brand new database there are no roles yet and
// nothing is changed.
const restrictedUserRoles = ["Member", "Coach", "Junior", "Unapproved", "Unverified"];
const otherUserFields = "id,first_name,last_name,avatar,role";

const bookingRoles = ["Member", "Coach", "Unapproved"];
const attendanceFields = "attended,completed,attendance_notes";
const leaderOrCreator = {
  _or: [
    {event: {leaders: {directus_users_id: {id: {_eq: "$CURRENT_USER"}}}}},
    {event: {user_created: {id: {_eq: "$CURRENT_USER"}}}}
  ]
};

async function roleIds(knex, names) {
  const roles = await knex("directus_roles").select("id", "name").whereIn("name", names);
  return Object.fromEntries(roles.map(role => [role.name, role.id]));
}

function permissions(knex, collection, action, ids) {
  return knex("directus_permissions").where({collection, action}).whereIn("role", ids);
}

export async function up(knex) {
  if (!(await knex.schema.hasTable("directus_roles")) || !(await knex.schema.hasTable("directus_permissions"))) {
    return;
  }

  const userRoleIds = Object.values(await roleIds(knex, restrictedUserRoles));
  await permissions(knex, "directus_users", "read", userRoleIds).update({fields: otherUserFields});

  const bookingRoleIds = Object.values(await roleIds(knex, bookingRoles));
  await permissions(knex, "event_bookings", "create", bookingRoleIds).delete();
  await permissions(knex, "event_bookings", "update", bookingRoleIds).update({
    permissions: JSON.stringify(leaderOrCreator),
    validation: null,
    fields: attendanceFields
  });
}

// Puts back the rules as they were before this migration
export async function down(knex) {
  if (!(await knex.schema.hasTable("directus_roles")) || !(await knex.schema.hasTable("directus_permissions"))) {
    return;
  }

  const userRoleIds = Object.values(await roleIds(knex, restrictedUserRoles));
  await permissions(knex, "directus_users", "read", userRoleIds).update({fields: "*"});

  const bookingRoleIds = await roleIds(knex, bookingRoles);

  for (const id of Object.values(bookingRoleIds)) {
    const existing = await permissions(knex, "event_bookings", "create", [id]).first();
    if (!existing) {
      await knex("directus_permissions").insert({
        role: id,
        collection: "event_bookings",
        action: "create",
        permissions: "{}",
        validation: "{}",
        presets: null,
        fields: "*"
      });
    }
  }

  const fullUpdate = Object.entries(bookingRoleIds).filter(([name]) => name !== "Unapproved").map(([, id]) => id);
  await permissions(knex, "event_bookings", "update", fullUpdate).update({permissions: "{}", validation: "{}", fields: "*"});

  if (bookingRoleIds.Unapproved) {
    await permissions(knex, "event_bookings", "update", [bookingRoleIds.Unapproved]).update({
      permissions: JSON.stringify({
        _and: [{
          _or: [
            {user: {parent: {id: {_eq: "$CURRENT_USER"}}}},
            {user: {_eq: "$CURRENT_USER"}},
            {user: {id: {_eq: "$CURRENT_USER"}}}
          ]
        }]
      }),
      validation: null,
      fields: "id,user_created,user_updated,date_created,date_updated,user,instance,event,status,attended,attendance_notes,medical_consent,checkin_code,photography_consent,completed"
    });
  }
}
