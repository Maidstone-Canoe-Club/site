import { mountSuspended } from "@nuxt/test-utils/runtime";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import AButton from "./AButton.vue"; // Adjust the import based on the actual path
import { type ButtonVariant, ButtonVariantClasses } from "~/utils/buttons";

describe("AButton Component", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });

  it("renders the button with default props", async () => {
    const wrapper = await mountSuspended(AButton);
    expect(wrapper.find("button").exists()).toBe(true);
    expect(wrapper.classes()).toContain("relative");
  });

  it("renders as a link when href prop is provided", async () => {
    const wrapper = await mountSuspended(AButton, {
      props: { href: "https://example.com" }
    });
    expect(wrapper.findComponent({ name: "NuxtLink" }).exists()).toBe(true);
  });

  it("renders as a link when to prop is provided", async () => {
    const wrapper = await mountSuspended(AButton, {
      props: { to: "/path" }
    });
    expect(wrapper.findComponent({ name: "NuxtLink" }).exists()).toBe(true);
  });

  it("applies the correct classes based on props", async () => {
    const variant: ButtonVariant = "secondary";

    const wrapper = await mountSuspended(AButton, {
      props: { variant, size: "lg", disabled: true }
    });

    const expected = ButtonVariantClasses[variant];

    // @ts-ignore
    const buttonClass = wrapper.vm.buttonClass;
    expect(buttonClass).toContain(expected);
  });

  it("disables the button when internalDisabled is true", async () => {
    const wrapper = await mountSuspended(AButton, {
      props: { disabled: true }
    });
    expect(wrapper.find("button").attributes("disabled")).toBe("");
  });

  it("shows the loader when internalLoading is true", async () => {
    const wrapper = await mountSuspended(AButton, {
      props: { loading: true }
    });
    await wrapper.vm.$nextTick();
    expect(wrapper.find(".animate-spin").exists()).toBe(true);
  });

  it("emits click event and handles action correctly", async () => {
    const actionMock = vi.fn(() => Promise.resolve());
    const wrapper = await mountSuspended(AButton, {
      props: { action: actionMock }
    });
    await wrapper.trigger("click");
    expect(wrapper.emitted().click).toBeTruthy();
    expect(actionMock).toHaveBeenCalled();
  });

  it("does not trigger action when button is disabled", async () => {
    const actionMock = vi.fn();
    const wrapper = await mountSuspended(AButton, {
      props: { action: actionMock, disabled: true }
    });
    await wrapper.trigger("click");
    expect(wrapper.emitted().click).toBeFalsy();
    expect(actionMock).not.toHaveBeenCalled();
  });

  it("disables button temporarily if disableTimeoutMs is provided", async () => {
    const wrapper = await mountSuspended(AButton, {
      props: { disableTimeoutMs: 500 }
    });

    // @ts-ignore
    expect(wrapper.vm.isDisabled.value).toBe(true);

    vi.advanceTimersByTime(500);
    await wrapper.vm.$nextTick();

    // @ts-ignore
    expect(wrapper.vm.isDisabled.value).toBe(false);
  });
});
