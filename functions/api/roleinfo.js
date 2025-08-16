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
    const response = await fetch(`https://discord.com/api/v10/guilds/${guildId}/roles`, {
      headers: { "Authorization": `Bot ${context.env.DISCORD_BOT_TOKEN}` }
    });

    if (!response.ok) {
      return new Response(JSON.stringify({ error: "Discord API Fehler", status: response.status }), {
        status: response.status,
        headers: { "Content-Type": "application/json" }
      });
    }

    const roles = await response.json();

    // Wichtige Daten zusammenstellen
    const roleData = roles.map(r => ({
      id: r.id,
      name: r.name,
      color: r.color,
      position: r.position,
      hoist: r.hoist, // wird oben angezeigt
      managed: r.managed, // Bot-Role oder System-Role
      mentionable: r.mentionable
    }));

    return new Response(JSON.stringify(roleData, null, 2), {
      headers: { "Content-Type": "application/json" }
    });

  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
                        }
