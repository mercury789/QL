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

        // считаем только .mp4 файлы
        count += list.objects.filter(obj => obj.key.endsWith(".mp4")).length
        cursor = list.truncated ? list.cursor : null
      } while (cursor)

      videoCounts[folder] = count
    }

    return new Response(JSON.stringify(videoCounts), {
      headers: { "Content-Type": "application/json" },
    })
  }
}
