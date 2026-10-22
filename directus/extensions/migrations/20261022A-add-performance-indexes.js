// Postgres does not index foreign key columns automatically, and Directus does not create
// indexes for relations, so the lookups the extensions make all end up as sequential scans.
//
// `directus bootstrap` runs this before `schema apply`, so on a brand new database the tables
// will not exist yet. Missing tables/columns are skipped rather than failing the boot.
const indexes = [
  { table: "event_bookings", columns: ["event", "instance"] },
  { table: "event_bookings", columns: ["user"] },
  { table: "event_exception", columns: ["event"] },
  { table: "events", columns: ["start_date"] },
  { table: "events", columns: ["parent_event"] },
  { table: "events_directus_users", columns: ["events_id"] },
  { table: "events_directus_users", columns: ["directus_users_id"] },
  { table: "orders", columns: ["user"] },
  { table: "medical_info", columns: ["user"] },
  { table: "emergency_contacts", columns: ["user"] },
  { table: "mailing_list_subscriber", columns: ["list"] },
  { table: "mail_forwards", columns: ["name"] },
  { table: "news_subscribers", columns: ["user"] },
  { table: "directus_users", columns: ["parent"] }
];

function indexName({ table, columns }) {
  return `${table}_${columns.join("_")}_index`;
}

async function canIndex(knex, { table, columns }) {
  if (!(await knex.schema.hasTable(table))) {
    return false;
  }

  for (const column of columns) {
    if (!(await knex.schema.hasColumn(table, column))) {
      return false;
    }
  }

  return true;
}

export async function up(knex) {
  for (const index of indexes) {
    if (!(await canIndex(knex, index))) {
      console.warn(`Skipping index ${indexName(index)}, table or column does not exist`);
      continue;
    }

    await knex.raw("CREATE INDEX IF NOT EXISTS ?? ON ?? (??)", [indexName(index), index.table, index.columns]);
  }
}

export async function down(knex) {
  for (const index of indexes) {
    await knex.raw("DROP INDEX IF EXISTS ??", [indexName(index)]);
  }
}
