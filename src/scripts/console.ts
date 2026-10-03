/** A hello for anyone who opens DevTools. Logs once per page load. */
import { site } from "@/data/site";
import { INK } from "@/lib/palette";

const TONY = String.raw`
    /\_/\
   ( o.o )   meow.
    > ^ <
   /     \
  (|     |)_/
`;

console.log(
  `%c${TONY}`,
  `font-family: ui-monospace, monospace; line-height: 1.15; color: ${INK};`,
);
console.log(
  `%cHi, curious one. Tony approves of people who open DevTools.%c

Say hello: ${site.email}
Psst: Tony likes being petted. Try fifty.`,
  "font-weight: 600; font-size: 13px;",
  "font-size: 12px;",
);
