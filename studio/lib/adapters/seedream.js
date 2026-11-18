'use strict';
/* Seedream (ByteDance) via BytePlus ModelArk — multi-reference image generation.
   Auth: Bearer ARK_API_KEY. Verify the endpoint, model id and the reference-image
   field against the current ModelArk docs before wiring — this is a scaffold. */

exports.describe = (a) => {
  console.log(`   POST https://ark.ap-southeast.bytepluses.com/api/v3/images/generations
   body: { model: "<seedream 5.5 model id>", prompt: <${a.prompt_file}>,
           image: [<refs/models/*.jpg casting headshots>, <refs/product/*.jpg SKU photos>,
                   <approved hero render for supporting shots>],
           size: <from aspect ${a.aspect}>, n: ${a.count} }
   attach ONLY the faces and SKUs of the people in this shot — extra references
   leak accessories and features across models.`);
};

exports.generate = async () => {
  throw new Error('seedream adapter not wired yet — implement fetch per describe()');
};
