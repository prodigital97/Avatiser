'use strict';
/* Kling — cinematic video, physics simulation. Auth: JWT signed from
   KLING_ACCESS_KEY + KLING_SECRET_KEY (HS256, short expiry) sent as Bearer.
   Async task API: create → poll. Verify at https://app.klingai.com/global/dev/docs. */

exports.describe = (a) => {
  console.log(`   auth: jwt = HS256({ iss: ACCESS_KEY, exp: now+30m, nbf: now-5s }, SECRET_KEY)
   POST https://api-singapore.klingai.com/v1/videos/image2video
   body: { model_name: "kling-v2-5", image: <approved keyframe from ${a.depends_on}>,
           prompt: <${a.prompt_file}>, duration: "${a.duration_s}",
           aspect_ratio: "${a.aspect}", mode: "pro" }
   then: GET /v1/videos/image2video/{task_id} until succeed → video url.
   Kling is the pick when the shot needs liquid/fabric/hair physics.`);
};

exports.generate = async () => {
  throw new Error('kling adapter not wired yet — implement jwt + create + poll per describe()');
};
