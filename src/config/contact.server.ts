// server-only fails the build if a client component imports this, so the
// recipient never reaches the public JS bundle (siteConfig does).
import "server-only";

export const CONTACT_RECIPIENT = "abelardosalazar94@gmail.com";
