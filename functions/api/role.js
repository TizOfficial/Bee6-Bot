export async function onRequest(context) {
  const url = new URL(context.request.url);
  const roleId = url.searchParams.get("id");
  const guildId = url.searchParams.get("guild");

  if (!roleId || !guildId) {
    return new Response(JSON.stringify({ error: "Bitte ?guild=GUILDID&role=ROLEID angeben" }), {
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

    // Rolle finden
    const role = roles.find(r => r.id === roleId);
    if (!role) {
      return new Response(JSON.stringify({ error: "Rolle nicht gefunden" }), {
        status: 404,
        headers: { "Content-Type": "application/json" }
      });
    }

    // Wichtige Role-Daten
    const roleData = {
      id: role.id,
      name: role.name,
      color: role.color,
      position: role.position,
      hoist: role.hoist, // wird oben angezeigt
      managed: role.managed, // Bot/System Role
      mentionable: role.mentionable,
      permissions: role.permissions,
      createdAt: new Date(Number(BigInt(role.id) >> 22n) + 1420070400000).toISOString(),
      createdAtDiscord: `<t:${Math.floor((Number(BigInt(role.id) >> 22n) + 1420070400000)/1000)}:f>`
    };

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
