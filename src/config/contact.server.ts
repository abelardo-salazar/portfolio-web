// Read per call, not at module scope: a missing variable must surface as a
// failed send, not break every page that imports the contact action.
import "server-only";

export const getContactRecipient = () =>
  process.env.CONTACT_EMAIL?.trim() || null;
