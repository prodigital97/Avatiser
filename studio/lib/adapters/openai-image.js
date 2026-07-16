'use strict';
/* GPT Image 2 — typography-strong statics (infographics, banners) + fallback
   product work. Auth: Bearer OPENAI_API_KEY. Verify model id at
   https://platform.openai.com/docs/guides/image-generation. */

exports.describe = (a) => {
  console.log(`   POST https://api.openai.com/v1/images/generations   (or /edits with reference images)
   body: { model: "gpt-image-2", prompt: <${a.prompt_file}>,
           size: <map ${a.aspect} → nearest supported e.g. 1024x1024 / 1536x1024>,
           n: ${a.count}, quality: "high" }
   for product-in-frame: use /v1/images/edits with refs/product/* as input
   images so the label is edited in, not imagined.`);
};

exports.generate = async () => {
  throw new Error('openai-image adapter not wired yet — implement fetch per describe()');
};
