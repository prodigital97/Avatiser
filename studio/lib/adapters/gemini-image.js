'use strict';
/* Nano Banana 2 Pro (Gemini image family) — product fidelity, backgrounds,
   composites. Auth: x-goog-api-key: GEMINI_API_KEY. Verify model id +
   endpoint at https://ai.google.dev/gemini-api/docs/image-generation. */

exports.describe = (a) => {
  console.log(`   POST https://generativelanguage.googleapis.com/v1beta/models/<nano-banana-pro-model-id>:generateContent
   body: { contents: [{ parts: [
             { text: <${a.prompt_file}> },
             { inline_data: { mime_type: "image/jpeg", data: <base64 refs/product/front.jpg> } },
             ...every reference image the prompt names
           ] }],
           generationConfig: { imageConfig: { aspectRatio: "${a.aspect}" } } }
   rule: NEVER call this for a product shot without the label reference parts.`);
};

exports.generate = async () => {
  throw new Error('gemini-image adapter not wired yet — implement fetch per describe()');
};
