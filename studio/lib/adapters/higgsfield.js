'use strict';
/* Higgsfield Soul 2.0 — character identity + photoreal portraits.
   Auth: Bearer HIGGSFIELD_API_KEY. Verify endpoints against
   https://docs.higgsfield.ai before wiring — their API surface moves fast. */

exports.describe = (a) => {
  console.log(`   POST https://platform.higgsfield.ai/v1/image/generate
   body: { model: "soul-2.0", prompt: <${a.prompt_file}>,
           aspect_ratio: "${a.aspect}", num_images: ${a.count},
           identity_id: <character-sheet.identity.soul_identity_id or omit on first run> }
   flow: first run (character.identity route) returns an identity you persist
   to character-sheet.json; every later call passes it back for zero face drift.`);
};

exports.generate = async () => {
  throw new Error('higgsfield adapter not wired yet — implement fetch per describe()');
};
