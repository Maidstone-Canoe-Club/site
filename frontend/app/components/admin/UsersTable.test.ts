import { mockNuxtImport, mountSuspended } from "@nuxt/test-utils/runtime";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { flushPromises } from "@vue/test-utils";
import UsersTable from "./UsersTable.vue";

const { getUsers } = vi.hoisted(() => ({ getUsers: vi.fn() }));

mockNuxtImport("useDirectusUsers", () => () => ({ getUsers }));
mockNuxtImport("useDirectus", () => () => async () => ({ data: [{ id: "r1", name: "Member" }, { id: "r2", name: "Unapproved" }] }));

function makeUsers (count: number) {
  return Array.from({ length: count }, (_, i) => ({
    id: `u${i}`,
    first_name: "First",
    last_name: `Last${i}`,
    email: `user${i}@example.com`,
    last_access: null,
    role: { id: i % 2 ? "r2" : "r1", name: i % 2 ? "Unapproved" : "Member" }
  }));
}

describe("UsersTable", () => {
  let mounted: { unmount: () => void } | null = null;

  beforeEach(() => {
    // useAsyncData caches by key across mounts, so start every test from a clean slate
    clearNuxtData();
    getUsers.mockReset();
    getUsers.mockResolvedValue({ data: makeUsers(12), meta: { filter_count: 30 } });
  });

  afterEach(() => {
    mounted?.unmount();
    mounted = null;
  });

  async function mountTable () {
    const wrapper = await mountSuspended(UsersTable, {
      global: {
        stubs: { UserEditModal: true, InputDropdown: true }
      }
    });
    mounted = wrapper;
    await flushPromises();
    return wrapper;
  }

  it("renders a row per user with names, emails and friendly role names", async () => {
    const wrapper = await mountTable();
    const rows = wrapper.findAll("tbody tr");

    expect(rows).toHaveLength(12);
    expect(rows[0]!.text()).toContain("First Last0");
    expect(rows[0]!.text()).toContain("user0@example.com");
    expect(rows[0]!.text()).toContain("Never");
    expect(rows[1]!.text()).toContain("Non-member");
  });

  it("sorts by last name ascending first, then toggles direction on the same column", async () => {
    const wrapper = await mountTable();
    expect(getUsers.mock.calls.at(-1)![0].params.sort).toBe("last_name");

    const nameHeader = wrapper.findAll("thead button").find(b => b.text().includes("Name"))!;
    await nameHeader.trigger("click");
    await flushPromises();
    expect(getUsers.mock.calls.at(-1)![0].params.sort).toBe("-last_name");

    const roleHeader = wrapper.findAll("thead button").find(b => b.text().includes("Role"))!;
    await roleHeader.trigger("click");
    await flushPromises();
    expect(getUsers.mock.calls.at(-1)![0].params.sort).toBe("role.name");
  });

  it("shows one page link per page and loads the next page", async () => {
    const wrapper = await mountTable();
    const pageButtons = wrapper.findAll("nav[aria-label='Pagination'] button").map(b => b.text());

    // 30 users at 12 per page is 3 pages, plus previous and next
    expect(pageButtons.filter(t => /^\d+$/.test(t))).toEqual(["1", "2", "3"]);

    const next = wrapper.findAll("nav[aria-label='Pagination'] button").at(-1)!;
    await next.trigger("click");
    await flushPromises();
    expect(getUsers.mock.calls.at(-1)![0].params.page).toBe(2);
  });

  it("collapses distant pages into a gap", async () => {
    getUsers.mockResolvedValue({ data: makeUsers(12), meta: { filter_count: 120 } });
    const wrapper = await mountTable();
    const pageButtons = wrapper.findAll("nav[aria-label='Pagination'] button").map(b => b.text()).filter(t => /^\d+$/.test(t));

    expect(pageButtons).toEqual(["1", "2", "10"]);
    expect(wrapper.find("nav[aria-label='Pagination']").text()).toContain("...");
  });
});
