/** A hello for anyone who opens DevTools. Logs once per page load. */
import { site } from "@/data/site";

declare global {
  interface Window {
    __tonyWasHere?: boolean;
  }
}

const TONY = String.raw`
    /\_/\
   ( o.o )   meow.
    > ^ <
   /     \
  (|     |)_/
`;

if (!window.__tonyWasHere) {
  window.__tonyWasHere = true;
  console.log(
    `%c${TONY}`,
    "font-family: ui-monospace, monospace; line-height: 1.15; color: #ee8b2a;",
  );
  console.log(
    `%cHi, curious one. Tony approves of people who open DevTools.%c

This site is open source: ${site.sourceUrl}
Say hello: ${site.email}
Psst: focus the game and press Space.`,
    "font-weight: 600; font-size: 13px;",
    "font-size: 12px;",
  );
}
