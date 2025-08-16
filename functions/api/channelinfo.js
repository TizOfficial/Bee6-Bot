export async function onRequest(context) {
  const url = new URL(context.request.url);
  const guildId = url.searchParams.get("id");

  if (!guildId) {
    return new Response(JSON.stringify({ error: "Bitte ?id=GUILDID angeben" }), {
      status: 400,
      headers: { "Content-Type": "application/json" }
    });
  }

  try {
    const response = await fetch(`https://discord.com/api/v10/guilds/${guildId}/channels`, {
      headers: { "Authorization": `Bot ${context.env.DISCORD_BOT_TOKEN}` }
    });

    if (!response.ok) {
      return new Response(JSON.stringify({ error: "Discord API Fehler", status: response.status }), {
        status: response.status,
        headers: { "Content-Type": "application/json" }
      });
    }

    const channels = await response.json();

    // Wichtige Daten zusammenstellen
    const channelData = channels.map(c => ({
      id: c.id,
      name: c.name,
      type: c.type, // 0=text, 2=voice, 4=category, 15=forum
      parent_id: c.parent_id || null,
      position: c.position,
      nsfw: c.nsfw || false
    }));

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
