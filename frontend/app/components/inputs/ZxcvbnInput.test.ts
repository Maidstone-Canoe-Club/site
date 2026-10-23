import { mountSuspended } from "@nuxt/test-utils/runtime";
import { describe, it, expect } from "vitest";
import { flushPromises } from "@vue/test-utils";
import type { Validation } from "@vuelidate/core";
import ZxcvbnInput from "./ZxcvbnInput.vue";

const v = { $error: false, $errors: [], $dirty: false, $touch: () => {} } as unknown as Validation;

// The strength check is debounced by 200ms after typing
const waitForCheck = () => new Promise(resolve => setTimeout(resolve, 300)).then(flushPromises);

function filledBars(wrapper: Awaited<ReturnType<typeof mountSuspended>>) {
  return wrapper.findAll("span.h-1").filter(bar => !bar.classes().includes("bg-gray-200")).length;
}

describe("ZxcvbnInput", () => {
  it("shows no strength for an empty password", async () => {
    const wrapper = await mountSuspended(ZxcvbnInput, {
      props: { modelValue: "", v, showStrength: true }
    });
    await flushPromises();

    expect(filledBars(wrapper)).toBe(0);
    expect(wrapper.text()).not.toMatch(/Very weak|So-so|Ok|Great!/);
  });

  it("rates a strong password as great", async () => {
    const wrapper = await mountSuspended(ZxcvbnInput, {
      props: { modelValue: "kayak-Medway-paddle-1987!", v, showStrength: true }
    });
    await flushPromises();

    expect(filledBars(wrapper)).toBe(4);
    expect(wrapper.text()).toContain("Great!");
  });

  it("updates the strength as the password is typed and cleared", async () => {
    const wrapper = await mountSuspended(ZxcvbnInput, {
      props: {
        "modelValue": "",
        v,
        "showStrength": true,
        "onUpdate:modelValue": (value: string) => wrapper.setProps({ modelValue: value })
      }
    });

    await wrapper.find("input").setValue("kayak-Medway-paddle-1987!");
    await waitForCheck();
    expect(wrapper.text()).toContain("Great!");

    await wrapper.find("input").setValue("");
    await waitForCheck();
    expect(filledBars(wrapper)).toBe(0);
    expect(wrapper.text()).not.toContain("Great!");
  });
});
