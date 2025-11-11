export default {
  async fetch(request, env, ctx) {
    const folders = ["general", "absolute", "lose", "upgrade", "finance"]
    const videoCounts = {}

    for (const folder of folders) {
      let count = 0
      let cursor = undefined

      do {
        const list = await env.R2.list({
          prefix: `${folder}/`,
          cursor,
        })

        count += list.objects.filter(obj => obj.key.endsWith(".mp4")).length
        cursor = list.truncated ? list.cursor : null
      } while (cursor)

      videoCounts[folder] = count
    }

    const response = new Response(JSON.stringify(videoCounts), {
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",  // вот этот заголовок решает проблему
        "Access-Control-Allow-Methods": "GET, OPTIONS",
      },
    })

    // для обработки preflight запроса OPTIONS, если нужно
    if (request.method === "OPTIONS") {
      return new Response(null, {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type",
        },
      })
    }

    return response
  }
}
