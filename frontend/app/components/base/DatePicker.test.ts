import { mountSuspended } from "@nuxt/test-utils/runtime";
import { describe, it, expect } from "vitest";
import { flushPromises } from "@vue/test-utils";
import DatePicker from "./DatePicker.vue";

describe("DatePicker", () => {
  it("renders the picker input with the placeholder", async () => {
    const wrapper = await mountSuspended(DatePicker, {
      props: { modelValue: null, placeholder: "Date of birth" }
    });

    const input = wrapper.find("input");
    expect(input.exists()).toBe(true);
    expect(input.attributes("placeholder")).toBe("Date of birth");
  });

  it("shows the selected date in UK format", async () => {
    const wrapper = await mountSuspended(DatePicker, {
      props: { modelValue: new Date(2026, 9, 22) }
    });
    await flushPromises();

    // The picker's own default is US style (MM/dd/yyyy)
    expect(wrapper.find("input").element.value).toBe("22 Oct 2026");
  });

  it("opens a calendar menu with Monday-first English day names", async () => {
    const wrapper = await mountSuspended(DatePicker, {
      props: { modelValue: new Date(2026, 9, 22) },
      attachTo: document.body
    });

    await wrapper.find("input").trigger("click");
    await flushPromises();

    const menuText = document.body.textContent ?? "";
    expect(menuText).toContain("Mo");
    expect(menuText).toMatch(/Oct/);
    wrapper.unmount();
  });
});
