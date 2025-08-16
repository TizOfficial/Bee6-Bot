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
    const response = await fetch(`https://discord.com/api/v10/guilds/${guildId}?with_counts=true`, {
      headers: {
        "Authorization": `Bot ${context.env.DISCORD_BOT_TOKEN}`
      }
    });

    if (!response.ok) {
      return new Response(JSON.stringify({ error: "Discord API Fehler", status: response.status }), {
        status: response.status,
        headers: { "Content-Type": "application/json" }
      });
    }

    const guild = await response.json();

    // Server erstellt (Snowflake -> Timestamp)
    const createdMs = Number(BigInt(guild.id) >> 22n) + 1420070400000;
    const createdUnix = Math.floor(createdMs / 1000);

    const guildData = {
      id: guild.id,
      name: guild.name,
      icon: guild.icon ? `https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.png` : null,
      banner: guild.banner ? `https://cdn.discordapp.com/banners/${guild.id}/${guild.banner}.png` : null,
      description: guild.description || null,
      owner_id: guild.owner_id,
      member_count: guild.approximate_member_count || null,
      presence_count: guild.approximate_presence_count || null,

      // normale Zeit
      createdAt: new Date(createdMs).toISOString(),

      // Discord Timestamps
      createdAtDiscord: `<t:${createdUnix}:f>`,
      createdAtRelative: `<t:${createdUnix}:R>`
    };

    return new Response(JSON.stringify(guildData, null, 2), {
      headers: { "Content-Type": "application/json" }
    });

  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
