export async function onRequest(context) {
  const url = new URL(context.request.url);
  const channelId = url.searchParams.get("id");

  if (!channelId) {
    return new Response(JSON.stringify({ error: "Bitte ?id=CHANNELID angeben" }), {
      status: 400,
      headers: { "Content-Type": "application/json" }
    });
  }

  try {
    const response = await fetch(`https://discord.com/api/v10/channels/${channelId}`, {
      headers: { "Authorization": `Bot ${context.env.DISCORD_BOT_TOKEN}` }
    });

    if (!response.ok) {
      return new Response(JSON.stringify({ error: "Discord API Fehler", status: response.status }), {
        status: response.status,
        headers: { "Content-Type": "application/json" }
      });
    }

    const channel = await response.json();

    // Wichtige Channel-Daten
    const channelData = {
      id: channel.id,
      name: channel.name,
      type: channel.type, // 0=text, 2=voice, 4=category, 15=forum
      guild_id: channel.guild_id || null,
      parent_id: channel.parent_id || null,
      position: channel.position,
      topic: channel.topic || null,
      nsfw: channel.nsfw || false,
      bitrate: channel.bitrate || null, // nur Voice
      user_limit: channel.user_limit || null, // nur Voice
      createdAt: new Date(Number(BigInt(channel.id) >> 22n) + 1420070400000).toISOString(),
      createdAtDiscord: `<t:${Math.floor((Number(BigInt(channel.id) >> 22n) + 1420070400000)/1000)}:f>`
    };

    return new Response(JSON.stringify(channelData, null, 2), {
      headers: { "Content-Type": "application/json" }
    });

  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
                                       }
