'use strict';
/* Seedance (BytePlus/Volcano Ark) — social & UGC video, image-to-video.
   Auth: Bearer ARK_API_KEY. Async task API: create → poll. Verify model id
   at https://docs.byteplus.com (ModelArk, seedance family). */

exports.describe = (a) => {
  console.log(`   POST https://ark.ap-southeast.bytepluses.com/api/v3/contents/generations/tasks
   body: { model: "seedance-1-5-pro",
           content: [
             { type: "text", text: <${a.prompt_file}> + " --ratio ${a.aspect} --duration ${a.duration_s}" },
             { type: "image_url", image_url: { url: <approved keyframe from depends_on: ${a.depends_on}> } }
           ] }
   then: GET .../tasks/{id} until status=succeeded → download video_url.
   Always image-to-video from the approved still — that is the product-
   consistency lock.`);
};

exports.generate = async () => {
  throw new Error('seedance adapter not wired yet — implement create+poll per describe()');
};
