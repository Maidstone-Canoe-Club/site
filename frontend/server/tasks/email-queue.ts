export default defineTask({
  meta: {
    name: "email-queue",
    description: "Call the email queue endpoint in directus"
  },
  run ({ payload, context }) {
    console.log("Calling email queue endpoint");
    return {
      result: "Success"
    };
  }
});
